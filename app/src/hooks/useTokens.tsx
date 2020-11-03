import { useEffect, useState } from 'react'

import { ERC20Service } from '../services/erc20'
import { getLogger } from '../util/logger'
import { etherTokenImage, getOmenTCRListId, getTokensByNetwork, pseudoEthAddress } from '../util/networks'
import { getImageUrl } from '../util/token'
import { Token } from '../util/types'

import { ConnectedWeb3Context } from './connectedWeb3'
import { useContracts } from './useContracts'

const logger = getLogger('Hooks::useTokens')

export const useTokens = (context: ConnectedWeb3Context, addEther?: boolean) => {
  const { dxTCR } = useContracts(context)
  const defaultTokens = getTokensByNetwork(context.networkId)
  if (addEther) {
    defaultTokens.splice(1, 0, { address: pseudoEthAddress, image: etherTokenImage, symbol: 'ETH', decimals: 18 })
  }
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

        // preserve ordering of default tokens and remove duplicates from TCR
        const combinedTokens: Token[] = Object.values(
          [...defaultTokens, ...tokens].reduce((prev, curr) => {
            // @ts-expect-error ignore
            if (prev[curr.symbol]) {
              return prev
            }
            return { ...prev, [curr.symbol]: curr }
          }, {}),
        )

        setTokens(combinedTokens)
      } catch (e) {
        logger.error('There was an error getting the tokens from the TCR:', e)
      }
    }

    fetchTokens()
    // eslint-disable-next-line
  }, [context.library, context.networkId, dxTCR, defaultTokens.length])

  return tokens
}
