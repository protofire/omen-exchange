import gql from 'graphql-tag'

const MarketDataFragment = gql`
  fragment marketData on FixedProductMarketMaker {
    id
    collateralVolume
    collateralToken
    outcomeTokenAmounts
    creationTimestamp
    title
    outcomes
    openingTimestamp
    resolutionTimestamp
    arbitrator
    category
  }
`

const OPEN = gql`
  query GetMarkets($first: Int!, $skip: Int!, $sortBy: String) {
    fixedProductMarketMakers(first: $first, skip: $skip, orderBy: $sortBy) {
      ...marketData
    }
  }
  ${MarketDataFragment}
`

const CLOSED = gql`
  query GetMarkets($first: Int!, $skip: Int!, $sortBy: String) {
    fixedProductMarketMakers(first: $first, skip: $skip, orderBy: $sortBy) {
      ...marketData
    }
  }
  ${MarketDataFragment}
`

const MY_MARKETS = gql`
  query GetMarkets($first: Int!, $skip: Int!, $sortBy: String, $account: String!) {
    fixedProductMarketMakers(first: $first, skip: $skip, orderBy: $sortBy, where: { creator: $account }) {
      ...marketData
    }
  }
  ${MarketDataFragment}
`

export const MARKETS_HOME: any = { OPEN, CLOSED, MY_MARKETS }
