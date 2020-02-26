import gql from 'graphql-tag'

// orderBy, orderDirection
// first, skip
// where { }
export const MARKETS = gql`
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
