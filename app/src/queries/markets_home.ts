import gql from 'graphql-tag'

export const MarketDataFragment = gql`
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

export const DEFAULT_OPTIONS = {
  onlyMyMarkets: false,
  onlyClosedMarkets: false,
  isCoronaVersion: false,
  category: 'All',
  title: null as Maybe<string>,
  arbitrator: null as Maybe<string>,
  templateId: null as Maybe<string>,
  currency: null as Maybe<string>,
}

export const buildQueryMarkets = (options = DEFAULT_OPTIONS) => {
  const {
    arbitrator,
    category,
    currency,
    isCoronaVersion,
    onlyClosedMarkets,
    onlyMyMarkets,
    templateId,
    title,
  } = options
  const whereClause = [
    onlyClosedMarkets ? 'answerFinalizedTimestamp_not: null' : '',
    onlyMyMarkets || isCoronaVersion ? 'creator_in: $accounts' : '',
    category === 'All' ? '' : 'category: $category',
    title ? 'title_contains: $title' : '',
    currency ? 'collateralToken: $currency' : '',
    arbitrator ? 'arbitrator: $arbitrator' : '',
    templateId ? 'templateId: $templateId' : !isCoronaVersion ? 'templateId_in: ["0", "2", "6"]' : '',
    isCoronaVersion ? '' : 'fee: $fee',
  ]
    .filter(s => s.length)
    .join(',')
  const query = gql`
    query GetMarkets($first: Int!, $skip: Int!, $sortBy: String, $category: String, $title: String, $currency: String, $arbitrator: String, $templateId: String, $accounts: [String!], $fee: String) {
      fixedProductMarketMakers(first: $first, skip: $skip, orderBy: $sortBy, orderDirection: desc, where: { ${whereClause} }) {
        ...marketData
      }
    }
    ${MarketDataFragment}
  `
  return query
}
