import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'

import { Status } from '../util/types'

const query = gql`
  query {
    _meta {
      block {
        hash
        number
      }
    }
  }
`

type Block = {
  number: number
  hash: string
}

type Result = {
  fetchData: () => Promise<void>
  block: Block
  status: Status
}

/**
 * Get metadata from the subgraph
 */
export const useGraphMeta = (): Result => {
  const { data, error, loading, refetch } = useQuery(query, {
    notifyOnNetworkStatusChange: true,
    skip: false,
  })

  const fetchData = async () => {
    await refetch()
  }

  return {
    block: data ? data._meta.block : null,
    fetchData,
    status: error ? Status.Error : loading ? Status.Loading : Status.Ready,
  }
}
