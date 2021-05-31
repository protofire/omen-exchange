import { useQuery } from '@apollo/react-hooks'
import { BigNumber, bigNumberify } from 'ethers/utils'
import gql from 'graphql-tag'
import { useEffect, useState } from 'react'

import { getLogger } from '../util/logger'
import { Status } from '../util/types'

const logger = getLogger('useTokenPrice')

const query = gql`
  query GetTokenPrice($id: String!) {
    token(id: $id) {
      usdPerToken
    }
  }
`

type GraphResponse = {
  token: {
    usdPerToken: string
  }
}

export const useTokenPrice = (address: string) => {
  const [tokenPrice, setTokenPrice] = useState(0)

  const { data: data, error: error, loading: loading } = useQuery<GraphResponse>(query, {
    notifyOnNetworkStatusChange: true,
    skip: false,
    variables: { id: address.toLowerCase() },
  })

  useEffect(() => {
    if (data && data.token.usdPerToken) {
      setTokenPrice(Number(data.token.usdPerToken))
    }
  }, [data])

  console.log(tokenPrice)

  return {
    tokenPrice,
    status: error ? Status.Error : loading ? Status.Loading : Status.Ready,
  }
}
