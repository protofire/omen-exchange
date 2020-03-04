import gql from 'graphql-tag'

enum queries {
  open = 'OPEN',
  closed = 'CLOSED',
  myMarkets = 'MY_MARKETS',
}
type Queries = {
  [K in queries]?: string
}

const MarketDataFragment = gql`
  fragment marketData on FixedProductMarketMaker {
    id
    collateralVolume
    collateralToken
    outcomeTokenAmounts
    creationTimestamp
    conditions(first: 1) {
      question {
        id
        title
        category
        arbitrator
        outcomes
        openingTimestamp
      }
    }
  }
`

const OPEN = gql`
  query GetMarkets($first: Int!, $skip: Int!, $criteria: String, $now: BigInt) {
    fixedProductMarketMakers(
      first: $first
      skip: $skip
      orderBy: $criteria
      where: { creationTimestamp_gt: $now }
    ) {
      ...marketData
    }
  }
  ${MarketDataFragment}
`

const CLOSED = gql`
  query GetMarkets($first: Int!, $skip: Int!, $criteria: String, $now: BigInt) {
    fixedProductMarketMakers(
      first: $first
      skip: $skip
      orderBy: $criteria
      where: { creationTimestamp_lte: $now }
    ) {
      ...marketData
    }
  }
  ${MarketDataFragment}
`

const MY_MARKETS = gql`
  query GetMarkets($first: Int!, $skip: Int!, $criteria: String, $now: BigInt, $account: String!) {
    fixedProductMarketMakers(
      first: $first
      skip: $skip
      orderBy: $criteria
      where: { creator: $account }
    ) {
      ...marketData
    }
  }
  ${MarketDataFragment}
`

export const MARKETS_HOME: any = { OPEN, CLOSED, MY_MARKETS }
