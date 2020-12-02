import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { useRef } from 'react'

import { getLogger } from '../util/logger'
import { waitABit } from '../util/tools'
import { Status } from '../util/types'

const logger = getLogger('useMeta')

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
  waitForBlockToSync: (blockNum: number) => Promise<void>
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

  const blockRef = useRef(data)
  if (data) {
    blockRef.current = data._meta.block
  }

  const waitForBlockToSync = async (blockNum: number) => {
    try {
      while (!blockRef.current || blockRef.current.number < blockNum) {
        await waitABit()
        await refetch()
      }
    } catch (error) {
      logger.log(error.message)
    }
  }

  const fetchData = async () => {
    await refetch()
  }

  return {
    block: data ? data._meta.block : null,
    waitForBlockToSync,
    fetchData,
    status: error ? Status.Error : loading ? Status.Loading : Status.Ready,
  }
}
