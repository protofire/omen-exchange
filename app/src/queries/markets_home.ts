import gql from 'graphql-tag'

// orderBy, orderDirection
// first, skip
// where { }

// Open (_gt) - Closed (_lte)
// , $now: Int
// where: { creationTimestamp_lte: $now }

// TODO Use fragments
enum queries {
  open = 'OPEN',
  closed = 'CLOSED',
  myMarkets = 'MY_MARKETS',
}
type Queries = {
  [K in queries]?: string
}

const OPEN = gql`
  query GetMarkets($first: Int!, $skip: Int!, $criteria: String, $now: BigInt) {
    fixedProductMarketMakers(
      first: $first
      skip: $skip
      orderBy: $criteria
      where: { creationTimestamp_gt: $now }
    ) {
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
  }
`

const CLOSED = gql`
  query GetMarkets($first: Int!, $skip: Int!, $criteria: String, $now: BigInt) {
    fixedProductMarketMakers(
      first: $first
      skip: $skip
      orderBy: $criteria
      where: { creationTimestamp_lte: $now }
    ) {
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
  }
`

const MY_MARKETS = gql`
  query GetMarkets($first: Int!, $skip: Int!, $criteria: String) {
    fixedProductMarketMakers(first: $first, skip: $skip, orderBy: $criteria) {
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
  }
`

export const MARKETS_HOME: any = { OPEN, CLOSED, MY_MARKETS }
