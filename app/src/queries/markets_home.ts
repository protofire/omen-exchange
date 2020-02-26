import gql from 'graphql-tag'

// orderBy, orderDirection
// first, skip
// where { }
export const MARKETS = gql`
  query GetMarkets($first: Int!, $skip: Int!) {
    fixedProductMarketMakers(first: $first, skip: $skip) {
      id
      collateralVolume
      collateralToken
      outcomeTokenAmounts
      creationTimestamp
      conditions(first: 1) {
        question {
          id
          data
          openingTimestamp
          template {
            id
          }
        }
      }
    }
  }
`
