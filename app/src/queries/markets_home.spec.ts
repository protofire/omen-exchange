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
  const expectedQuery = getExpectedQuery('openingTimestamp_gt: $now, templateId_in: ["0", "2", "6"], fee_lte: $fee')
  expect(query).toBe(expectedQuery)
})

test('Query markets', () => {
  const query = buildQueryMarkets({
    ...DEFAULT_OPTIONS,
    state: MarketStates.myMarkets,
    category: 'SimpleQuestions',
  })
  const expectedQuery = getExpectedQuery(
    'creator_in: $accounts, category: $category, templateId_in: ["0", "2", "6"], fee: $fee',
  )
  expect(query).toBe(expectedQuery)
})

test('Markets with template_id', () => {
  const query = buildQueryMarkets({
    ...DEFAULT_OPTIONS,
    state: MarketStates.myMarkets,
    templateId: '2',
  })
  const expectedQuery = getExpectedQuery('creator_in: $accounts, templateId: $templateId, fee: $fee')
  expect(query).toBe(expectedQuery)
})

test('Markets closed with title and arbitrator', () => {
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
    'answerFinalizedTimestamp_lt: $now, title_contains: $title, arbitrator: $arbitrator, templateId: $templateId, fee: $fee',
  )
  expect(query).toBe(expectedQuery)
})

test('Query pending markets', () => {
  const query = buildQueryMarkets({
    ...DEFAULT_OPTIONS,
    state: MarketStates.pending,
    category: 'SimpleQuestions',
  })
  const expectedQuery = getExpectedQuery(
    'answerFinalizedTimestamp_gt: $now, category: $category, templateId_in: ["0", "2", "6"], fee: $fee',
  )
  expect(query).toBe(expectedQuery)
})
