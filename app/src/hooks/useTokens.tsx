import { useEffect, useState } from 'react'

import { DEFAULT_TOKEN } from '../common/constants'
import { ERC20Service } from '../services/erc20'
import { getLogger } from '../util/logger'
import { getOmenTCRListId, getToken, getTokensByNetwork } from '../util/networks'
import { getImageUrl } from '../util/token'
import { Token } from '../util/types'

import { ConnectedWeb3Context } from './connectedWeb3'
import { useContracts } from './useContracts'

const logger = getLogger('Hooks::useTokens')

export const useTokens = (context: ConnectedWeb3Context) => {
  const { dxTCR } = useContracts(context)
  const defaultTokens = [getToken(context.networkId, DEFAULT_TOKEN)]
  const [tokens, setTokens] = useState<Token[]>(defaultTokens)

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const omenTCRListId = getOmenTCRListId(context.networkId)
        const tokensAddresses = await dxTCR.getTokens(omenTCRListId)
        const tokens = await Promise.all(
          tokensAddresses.map(async tokenAddress => {
            const erc20 = new ERC20Service(context.library, null, tokenAddress)
            const erc20Info = await erc20.getProfileSummary()
            const token = {
              ...erc20Info,
              image: getImageUrl(tokenAddress),
            }

            return token
          }),
        )
        setTokens(tokens)
      } catch (e) {
        logger.error('There was an error getting the tokens from the TCR:', e)
        const tokens = getTokensByNetwork(context.networkId)
        setTokens(tokens)
      }
    }

    fetchTokens()
  }, [context.library, context.networkId, dxTCR])

  return tokens
}
