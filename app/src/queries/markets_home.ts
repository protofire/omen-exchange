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
    answerFinalizedTimestamp
  }
`

export const buildQueryMarkets = (
  options = {
    onlyMyMarkets: false,
    onlyClosedMarkets: false,
    category: null,
    title: null,
    arbitrator: null,
    templateId: null,
    currency: null,
  },
) => {
  const { arbitrator, category, currency, onlyClosedMarkets, onlyMyMarkets, templateId, title } = options
  const whereClause = [
    onlyClosedMarkets ? 'answerFinalizedTimestamp_not: null' : '',
    onlyMyMarkets ? 'creator: $account' : '',
    category === 'All' ? '' : 'category: $category',
    title ? 'title_contains: $title' : '',
    currency ? 'collateralToken: $currency' : '',
    arbitrator ? 'arbitrator: $arbitrator' : '',
    templateId ? 'templateId: $templateId' : 'templateId_in: ["0", "2"]',
  ]
    .filter(s => s.length)
    .join(',')
  const query = gql`
    query GetMarkets($first: Int!, $skip: Int!, $sortBy: String, $category: String, $title: String, $currency: String, $arbitrator: String, $templateId: String, $account: String!, $fee: String) {
      fixedProductMarketMakers(first: $first, skip: $skip, orderBy: $sortBy, orderDirection: desc, where: { fee: $fee, ${whereClause} }) {
        ...marketData
      }
    }
    ${MarketDataFragment}
  `
  //console.log(query)
  return query
}
