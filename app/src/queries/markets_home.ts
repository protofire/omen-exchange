import { BigNumber } from 'ethers/utils'
import gql from 'graphql-tag'

import { ConnectedWeb3Context } from '../hooks/connectedWeb3'

import { MarketFilters, MarketStates, MarketsSortCriteria } from './../util/types'

export const MarketDataFragment = gql`
  fragment marketData on FixedProductMarketMaker {
    id
    collateralVolume
    collateralToken
    outcomeTokenAmounts
    title
    outcomes
    openingTimestamp
    arbitrator
    category
    templateId
  }
`

export type GraphMarketMakerDataItem = {
  id: string
  collateralVolume: string
  collateralToken: string
  outcomeTokenAmounts: string[]
  title: string
  outcomes: Maybe<string[]>
  openingTimestamp: string
  arbitrator: string
  category: string
  templateId: string
}

export type MarketMakerDataItem = {
  address: string
  collateralVolume: BigNumber
  collateralToken: string
  outcomeTokenAmounts: BigNumber[]
  title: string
  outcomes: Maybe<string[]>
  openingTimestamp: Date
  arbitrator: string
  category: string
  templateId: number
}

export type CategoryDataItem = {
  id: string
  numOpenConditions: number
}

export const DEFAULT_OPTIONS = {
  state: MarketStates.open,
  whitelistedCreators: false,
  whitelistedTemplateIds: true,
  category: 'All',
  title: null as Maybe<string>,
  arbitrator: null as Maybe<string>,
  templateId: null as Maybe<string>,
  currency: null as Maybe<string>,
  sortBy: null as Maybe<MarketsSortCriteria>,
  sortByDirection: 'desc' as 'asc' | 'desc',
  context: null as Maybe<ConnectedWeb3Context>,
}

export const queryMyMarkets = gql`
  query GetMyMarkets($account: String!, $first: Int!, $skip: Int!) {
    account(id: $account) {
      fpmmParticipations(first: $first, skip: $skip) {
        fixedProductMarketMakers: fpmm {
          ...marketData
        }
      }
    }
  }
  ${MarketDataFragment}
`

type buildQueryType = MarketFilters & {
  whitelistedCreators: boolean
  whitelistedTemplateIds: boolean
  context: Maybe<ConnectedWeb3Context>
}
export const buildQueryMarkets = (options: buildQueryType = DEFAULT_OPTIONS) => {
  const {
    arbitrator,
    category,
    context,
    currency,
    state,
    templateId,
    title,
    whitelistedCreators,
    whitelistedTemplateIds,
  } = options

  const MIN_TIMEOUT = context && context.networkId === 1 ? 86400 : 0
  const whereClause = [
    state === MarketStates.closed ? 'answerFinalizedTimestamp_lt: $now' : '',
    state === MarketStates.open ? 'openingTimestamp_gt: $now' : '',
    state === MarketStates.pending ? 'openingTimestamp_lt: $now' : '',
    state === MarketStates.pending ? 'answerFinalizedTimestamp: null' : '',
    state === MarketStates.finalizing ? 'answerFinalizedTimestamp_gt: $now' : '',
    whitelistedCreators ? 'creator_in: $accounts' : '',
    category === 'All' ? '' : 'category: $category',
    title ? 'title_contains: $title' : '',
    currency ? 'collateralToken: $currency' : '',
    arbitrator ? 'arbitrator: $arbitrator' : 'arbitrator_in: $knownArbitrators',
    templateId ? 'templateId: $templateId' : whitelistedTemplateIds ? 'templateId_in: ["0", "2", "6"]' : '',
    'fee_lte: $fee',
    `timeout_gte: ${MIN_TIMEOUT}`,
  ]
    .filter(s => s.length)
    .join(',')

  const query = gql`
    query GetMarkets($first: Int!, $skip: Int!, $sortBy: String, $sortByDirection: String, $category: String, $title: String, $currency: String, $arbitrator: String, $knownArbitrators: [String!], $templateId: String, $accounts: [String!], $now: Int, $fee: String) {
      fixedProductMarketMakers(first: $first, skip: $skip, orderBy: $sortBy, orderDirection: $sortByDirection, where: { ${whereClause} }) {
        ...marketData
      }
    }
    ${MarketDataFragment}
  `
  return query
}

export const queryCategories = gql`
  {
    categories(first: 100, orderBy: numOpenConditions, orderDirection: desc) {
      id
      numOpenConditions
    }
  }
`
