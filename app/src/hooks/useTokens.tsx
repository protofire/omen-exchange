import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { useEffect, useState } from 'react'

import { getNativeAsset, getOmenTCRListId, getTokensByNetwork } from '../util/networks'
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

export const useTokens = (context: ConnectedWeb3Context, addNativeAsset?: boolean) => {
  const defaultTokens = getTokensByNetwork(context.networkId)
  if (addNativeAsset) {
    defaultTokens.splice(1, 0, getNativeAsset(context.networkId))
  }
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

    // preserve ordering of default tokens and remove duplicates from TCR
    const combinedTokens: Token[] = Object.values(
      [...defaultTokens, ...tokensWithImage].reduce((prev, curr) => {
        // @ts-expect-error ignore
        if (prev[curr.symbol.toLowerCase()]) {
          return prev
        }
        return { ...prev, [curr.symbol.toLowerCase()]: curr }
      }, {}),
    )

    if (!isObjectEqual(tokens, combinedTokens)) {
      setTokens(combinedTokens)
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
