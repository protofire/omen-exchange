import { BigNumber } from 'ethers/utils'
import gql from 'graphql-tag'

import { BuildQueryType, MarketSource, MarketStates, MarketsSortCriteria } from './../util/types'

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
    scaledLiquidityParameter
    curatedByDxDao
    klerosTCRregistered
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
  scaledLiquidityParameter: string
  klerosTCRregistered: Maybe<boolean>
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
  scaledLiquidityParameter: number
  klerosTCRregistered: Maybe<boolean>
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
  marketSource: MarketSource.DXDAO,
  sortBy: null as Maybe<MarketsSortCriteria>,
  sortByDirection: 'desc' as 'asc' | 'desc',
  networkId: 1 as Maybe<number>,
}

export const queryMyMarkets = gql`
  query GetMyMarkets($account: String!, $first: Int!, $skip: Int!) {
    account(id: $account) {
      fpmmParticipations(first: $first, skip: $skip, orderBy: creationTimestamp, orderDirection: desc) {
        fixedProductMarketMakers: fpmm {
          ...marketData
        }
      }
    }
  }
  ${MarketDataFragment}
`

export const buildQueryMarkets = (options: BuildQueryType = DEFAULT_OPTIONS) => {
  const {
    arbitrator,
    category,
    currency,
    marketSource,
    networkId,
    state,
    templateId,
    title,
    whitelistedCreators,
    whitelistedTemplateIds,
  } = options

  const MIN_TIMEOUT = networkId && networkId === 1 ? 86400 : 0
  const whereClause = [
    state === MarketStates.closed ? 'answerFinalizedTimestamp_lt: $now' : '',
    state === MarketStates.open ? 'openingTimestamp_gt: $now' : '',
    state === MarketStates.finalizing ? 'openingTimestamp_lt: $now' : '',
    state === MarketStates.finalizing ? 'isPendingArbitration: false' : '',
    state === MarketStates.finalizing ? 'answerFinalizedTimestamp: null' : '',
    state === MarketStates.arbitrating ? 'isPendingArbitration: true' : '',
    whitelistedCreators ? 'creator_in: $accounts' : '',
    category === 'All' ? '' : 'category: $category',
    title ? 'title_contains: $title' : '',
    currency ? 'collateralToken: $currency' : '',
    arbitrator ? 'arbitrator: $arbitrator' : 'arbitrator_in: $knownArbitrators',
    templateId ? 'templateId: $templateId' : whitelistedTemplateIds ? 'templateId_in: ["0", "2", "6"]' : '',
    'fee_lte: $fee',
    `timeout_gte: ${MIN_TIMEOUT}`,
    marketSource === MarketSource.DXDAO ? `curatedByDxDao: true` : `klerosTCRregistered: true`,
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
      numClosedConditions
      numConditions
    }
  }
`

export const queryTopCategories = gql`
  query GetTopCategories($first: Int!) {
    categories(first: $first, orderBy: numOpenConditions, orderDirection: desc) {
      id
    }
  }
`
