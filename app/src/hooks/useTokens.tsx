import { useQuery } from '@apollo/react-hooks'
import { useWeb3React } from '@web3-react/core'
import gql from 'graphql-tag'
import { useEffect, useState } from 'react'

import { getOmenTCRListId, getTokensByNetwork } from '../util/networks'
import { getImageUrl } from '../util/token'
import { isObjectEqual } from '../util/tools'
import { Token } from '../util/types'

const query = gql`
  query GetTokenList($listId: String!) {
    tokenLists(where: { listId: $listId }) {
      id
      listId
      listName
      activeTokenCount
      tokens {
        id
        address
        name
        symbol
        decimals
      }
    }
  }
`

type GraphResponse = {
  tokenLists: [
    {
      tokens: Token[]
      listId: string
      listName: string
      id: string
    },
  ]
}

export const useTokens = () => {
  const context = useWeb3React()
  const chainId = context.chainId == null ? 1 : context.chainId

  const defaultTokens = getTokensByNetwork(chainId)
  const [tokens, setTokens] = useState<Token[]>(defaultTokens)
  const omenTCRListId = getOmenTCRListId(chainId)

  const { data, error, loading, refetch } = useQuery<GraphResponse>(query, {
    notifyOnNetworkStatusChange: true,
    skip: false,
    variables: { listId: omenTCRListId.toString() },
  })

  if (!error && !loading && data?.tokenLists && data.tokenLists.length > 0) {
    const tokensWithImage: Token[] = data.tokenLists[0].tokens.map(token => ({
      ...token,
      image: getImageUrl(token.address),
    }))
    if (!isObjectEqual(tokens, tokensWithImage)) {
      setTokens(tokensWithImage)
    }
  }

  useEffect(() => {
    const reload = async () => {
      await refetch()
    }
    reload()
    // eslint-disable-next-line
  }, [context.library, chainId])

  return tokens
}
