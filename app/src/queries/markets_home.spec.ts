/* eslint-env jest */
import gql from 'graphql-tag'

import { MarketStates } from '../util/types'

import { DEFAULT_OPTIONS, MarketDataFragment, buildQueryMarkets } from './markets_home'

const getExpectedQuery = (whereClause: string) => {
  return gql`
  query GetMarkets($first: Int!, $skip: Int!, $sortBy: String, $sortByDirection: String, $category: String, $title: String, $currency: String, $arbitrator: String, $templateId: String, $accounts: [String!], $now: Int, $fee: String) {
    fixedProductMarketMakers(first: $first, skip: $skip, orderBy: $sortBy, orderDirection: $sortByDirection, where: { ${whereClause} }) {
      ...marketData
    }
  }
  ${MarketDataFragment}
`
}

test('Query markets with default options', () => {
  const query = buildQueryMarkets(DEFAULT_OPTIONS)
  const expectedQuery = getExpectedQuery(
    'answerFinalizedTimestamp: null, templateId_in: ["0", "2", "6"], fee_lte: $fee',
  )
  expect(query).toBe(expectedQuery)
})

test('Query markets for corona markets', () => {
  const query = buildQueryMarkets({ ...DEFAULT_OPTIONS, whitelistedCreators: true, whitelistedTemplateIds: false })
  const expectedQuery = getExpectedQuery('answerFinalizedTimestamp: null, creator_in: $accounts, fee_lte: $fee')
  expect(query).toBe(expectedQuery)
})

test('Query markets not corona markets', () => {
  const query = buildQueryMarkets({
    ...DEFAULT_OPTIONS,
    state: MarketStates.myMarkets,
    category: 'SimpleQuestions',
  })
  const expectedQuery = getExpectedQuery(
    'creator_in: $accounts, category: $category, templateId_in: ["0", "2", "6"], fee_lte: $fee',
  )
  expect(query).toBe(expectedQuery)
})

test('Not corona markets with template_id', () => {
  const query = buildQueryMarkets({
    ...DEFAULT_OPTIONS,
    state: MarketStates.myMarkets,
    templateId: '2',
  })
  const expectedQuery = getExpectedQuery('creator_in: $accounts, templateId: $templateId, fee_lte: $fee')
  expect(query).toBe(expectedQuery)
})

test('Corona markets with template_id', () => {
  const query = buildQueryMarkets({
    ...DEFAULT_OPTIONS,
    whitelistedCreators: true,
    whitelistedTemplateIds: false,
    templateId: '2',
  })
  const expectedQuery = getExpectedQuery(
    'answerFinalizedTimestamp: null, creator_in: $accounts, templateId: $templateId, fee_lte: $fee',
  )
  expect(query).toBe(expectedQuery)
})

test('Not corona markets closed with title and arbitrator', () => {
  const query = buildQueryMarkets({
    ...DEFAULT_OPTIONS,
    whitelistedCreators: false,
    whitelistedTemplateIds: true,
    state: MarketStates.closed,
    templateId: '2',
    title: 'test',
    arbitrator: 'arbitratorTest',
  })
  const expectedQuery = getExpectedQuery(
    'answerFinalizedTimestamp_lt: $now, title_contains: $title, arbitrator: $arbitrator, templateId: $templateId, fee_lte: $fee',
  )
  expect(query).toBe(expectedQuery)
})

test('Closed corona markets with currency', () => {
  const query = buildQueryMarkets({
    ...DEFAULT_OPTIONS,
    whitelistedCreators: true,
    whitelistedTemplateIds: false,
    state: MarketStates.closed,
    templateId: '2',
    title: 'test',
    currency: 'currencyTest',
  })
  const expectedQuery = getExpectedQuery(
    'answerFinalizedTimestamp_lt: $now, creator_in: $accounts, title_contains: $title, collateralToken: $currency, templateId: $templateId, fee_lte: $fee',
  )
  expect(query).toBe(expectedQuery)
})

test('Query pending markets not corona markets', () => {
  const query = buildQueryMarkets({
    ...DEFAULT_OPTIONS,
    state: MarketStates.pending,
    category: 'SimpleQuestions',
  })
  const expectedQuery = getExpectedQuery(
    'answerFinalizedTimestamp_gt: $now, category: $category, templateId_in: ["0", "2", "6"], fee_lte: $fee',
  )
  expect(query).toBe(expectedQuery)
})
