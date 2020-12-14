import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { useEffect, useState } from 'react'

import { getOmenTCRListId, getTokensByNetwork } from '../util/networks'
import { getImageUrl } from '../util/token'
import { isObjectEqual } from '../util/tools'
import { Token } from '../util/types'

import { ConnectedWeb3Context } from './connectedWeb3'

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

export const useTokens = (context: ConnectedWeb3Context) => {
  const defaultTokens = getTokensByNetwork(context.networkId)
  const [tokens, setTokens] = useState<Token[]>(defaultTokens)
  const omenTCRListId = getOmenTCRListId(context.networkId)

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
  }, [context.library, context.networkId])

  return tokens
}
