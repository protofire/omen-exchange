import gql from 'graphql-tag'

const query = gql`
  query fpmmTrades($id: ID!) {
    fpmmTrades(where: { fpmm: $id }) {
      id
      creator {
        id
      }
      type
      outcomeTokensTraded
      collateralAmount
      collateralAmountUSD
      creationTimestamp
    }
  }
`
