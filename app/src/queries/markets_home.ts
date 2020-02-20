import gql from 'graphql-tag'

export const marketsVolumeQuery = gql`
  {
    fixedProductMarketMakers {
      id
      collateralVolume
      conditions {
        question {
          id
          data
        }
      }
    }
  }
`
