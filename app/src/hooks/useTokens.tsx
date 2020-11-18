import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'

import { ERC20Service } from '../services/erc20'
import { getLogger } from '../util/logger'
import { getOmenTCRListId, getTokensByNetwork } from '../util/networks'
import { getImageUrl } from '../util/token'
import { Token } from '../util/types'

import { useContracts } from './useContracts'

const logger = getLogger('Hooks::useTokens')

export const useTokens = () => {
  const context = useWeb3React()
  const chainId = context.chainId == null ? 1 : context.chainId

  const { dxTCR } = useContracts()
  const defaultTokens = getTokensByNetwork(chainId)
  const [tokens, setTokens] = useState<Token[]>(defaultTokens)

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const omenTCRListId = getOmenTCRListId(chainId)
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
      }
    }

    fetchTokens()
  }, [context.library, chainId, dxTCR])

  return tokens
}
