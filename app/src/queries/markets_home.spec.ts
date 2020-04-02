/* eslint-env jest */
import gql from 'graphql-tag'

import { DEFAULT_OPTIONS, MarketDataFragment, buildQueryMarkets } from './markets_home'

const getExpectedQuery = (whereClause: string) => {
  return gql`
  query GetMarkets($first: Int!, $skip: Int!, $sortBy: String, $category: String, $title: String, $currency: String, $arbitrator: String, $templateId: String, $accounts: [String!], $fee: String) {
    fixedProductMarketMakers(first: $first, skip: $skip, orderBy: $sortBy, orderDirection: desc, where: { ${whereClause} }) {
      ...marketData
    }
  }
  ${MarketDataFragment}
`
}

test('Query markets with default options', () => {
  const query = buildQueryMarkets(DEFAULT_OPTIONS)
  const expectedQuery = getExpectedQuery('templateId_in: ["0", "2", "6"], fee: $fee')
  expect(query).toBe(expectedQuery)
})

test('Query markets for corona markets', () => {
  const query = buildQueryMarkets({ ...DEFAULT_OPTIONS, isCoronaVersion: true })
  const expectedQuery = getExpectedQuery('creator_in: $accounts, fee: $fee')
  expect(query).toBe(expectedQuery)
})

test('Query markets not corona markets', () => {
  const query = buildQueryMarkets({
    ...DEFAULT_OPTIONS,
    onlyMyMarkets: true,
    category: 'SimpleQuestions',
  })
  const expectedQuery = getExpectedQuery(
    'creator_in: $accounts, category: $category, templateId_in: ["0", "2", "6"], fee: $fee',
  )
  expect(query).toBe(expectedQuery)
})

test('Not corona markets with template_id', () => {
  const query = buildQueryMarkets({
    ...DEFAULT_OPTIONS,
    onlyMyMarkets: true,
    templateId: '2',
  })
  const expectedQuery = getExpectedQuery('creator_in: $accounts, templateId: $templateId, fee: $fee')
  expect(query).toBe(expectedQuery)
})

test('Corona markets with template_id', () => {
  const query = buildQueryMarkets({
    ...DEFAULT_OPTIONS,
    isCoronaVersion: true,
    templateId: '2',
  })
  const expectedQuery = getExpectedQuery('creator_in: $accounts, templateId: $templateId, fee: $fee')
  expect(query).toBe(expectedQuery)
})

test('Closed not corona markets with title and arbitrator', () => {
  const query = buildQueryMarkets({
    ...DEFAULT_OPTIONS,
    isCoronaVersion: false,
    onlyClosedMarkets: true,
    templateId: '2',
    title: 'test',
    arbitrator: 'arbitratorTest',
  })
  const expectedQuery = getExpectedQuery(
    'answerFinalizedTimestamp_not: null, title_contains: $title, arbitrator: $arbitrator, templateId: $templateId, fee: $fee',
  )
  expect(query).toBe(expectedQuery)
})

test('Closed corona markets with currency', () => {
  const query = buildQueryMarkets({
    ...DEFAULT_OPTIONS,
    isCoronaVersion: true,
    onlyClosedMarkets: true,
    templateId: '2',
    title: 'test',
    currency: 'currencyTest',
  })
  const expectedQuery = getExpectedQuery(
    'answerFinalizedTimestamp_not: null, creator_in: $accounts, title_contains: $title, collateralToken: $currency, templateId: $templateId, fee: $fee',
  )
  expect(query).toBe(expectedQuery)
})
