import { useEffect, useState } from 'react'

import { ALLOW_CUSTOM_TOKENS, DEFAULT_TOKEN } from '../common/constants'
import { getToken } from '../util/networks'
import { Token } from '../util/types'

import { ConnectedWeb3Context } from './connectedWeb3'
import { useContracts } from './useContracts'

export const useTokens = (context: ConnectedWeb3Context) => {
  const defaultTokens = [getToken(context.networkId, DEFAULT_TOKEN)]
  const [tokens, setTokens] = useState<Token[]>(defaultTokens)
  const { kleros } = useContracts(context)

  useEffect(() => {
    const fetchTokens = async () => {
      const tokens = await kleros.queryTokens()
      setTokens(tokens)
    }

    if (ALLOW_CUSTOM_TOKENS) {
      fetchTokens()
    }
  }, [kleros])

  return tokens
}
