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

export const buildQueryMarkets = (options = { onlyMyMarkets: false, category: null, title: null }) => {
  const { category, onlyMyMarkets, title } = options
  const whereClause = [
    onlyMyMarkets ? 'creator: $account' : '',
    category === 'All' ? '' : 'category: $category',
    title ? 'title: $title' : '',
  ]
    .filter(s => s.length)
    .join(',')
  return gql`
    query GetMarkets($first: Int!, $skip: Int!, $sortBy: String, $category: String, $title: String, $account: String!) {
      fixedProductMarketMakers(first: $first, skip: $skip, orderBy: $sortBy, where: { ${whereClause} }) {
        ...marketData
      }
    }
    ${MarketDataFragment}
  `
}
