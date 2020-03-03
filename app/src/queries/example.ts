import gql from 'graphql-tag'

// eslint-disable-next-line no-warning-comments
// TODO: Remove these queries and add the ones that would really use from the Alan subgraph, and rename the file with a proper name
export const fetchConditionsQuery = gql`
  {
    conditions(first: 5) {
      id
      creator
      oracle
      questionId
    }
  }
`
