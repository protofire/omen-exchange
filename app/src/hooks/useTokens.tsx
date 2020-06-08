import { useEffect, useState } from 'react'

import { ALLOW_CUSTOM_TOKENS, DEFAULT_TOKEN } from '../common/constants'
import { getToken, getTokensByNetwork } from '../util/networks'
import { Token } from '../util/types'

import { ConnectedWeb3Context } from './connectedWeb3'

export const useTokens = (context: ConnectedWeb3Context) => {
  const defaultTokens = [getToken(context.networkId, DEFAULT_TOKEN)]
  const [tokens, setTokens] = useState<Token[]>(defaultTokens)

  useEffect(() => {
    const fetchTokens = async () => {
      const tokens = getTokensByNetwork(context.networkId)
      setTokens(tokens)
    }

    if (ALLOW_CUSTOM_TOKENS) {
      fetchTokens()
    }
  }, [context.networkId])

  return tokens
}
