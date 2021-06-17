import axios from 'axios'
import { BigNumber } from 'ethers/utils'
import { useEffect, useState } from 'react'

import { DAI_TO_XDAI_TOKEN_BRIDGE_ADDRESS, OMNI_BRIDGE_MAINNET_ADDRESS } from '../common/constants'
import { ERC20Service } from '../services'
import {
  getGraphUris,
  getNativeAsset,
  getOmenTCRListId,
  getTokensByNetwork,
  pseudoNativeAssetAddress,
} from '../util/networks'
import { getImageUrl } from '../util/token'
import { isObjectEqual } from '../util/tools'
import { Token } from '../util/types'

import { ConnectedWeb3Context } from './connectedWeb3'

const query = `
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

export const useTokens = (
  context: ConnectedWeb3Context,
  addNativeAsset?: boolean,
  addBalances?: boolean,
  relay?: boolean,
  addBridgeAllowance?: boolean,
) => {
  let defaultTokens: Token[] = []
  if (context) {
    defaultTokens = getTokensByNetwork(context.networkId)
    if (addNativeAsset) {
      defaultTokens.unshift(getNativeAsset(context.networkId, relay))
    }
  }
  const [tokens, setTokens] = useState<Token[]>(defaultTokens)

  const fetchTokenDetails = async () => {
    if (context) {
      const omenTCRListId = getOmenTCRListId(context.networkId)
      const { httpUri } = getGraphUris(context.networkId)
      const variables = { listId: omenTCRListId.toString() }
      const response = await axios.post(httpUri, { query, variables })
      const data: GraphResponse = response.data.data

      if (data?.tokenLists) {
        let tokenData = defaultTokens
        if (data.tokenLists.length) {
          const tokensWithImage: Token[] = data.tokenLists[0].tokens.map(token => ({
            ...token,
            image: getImageUrl(token.address),
          }))

          // preserve ordering of default tokens and remove duplicates from TCR
          tokenData = Object.values(
            [...defaultTokens, ...tokensWithImage].reduce((prev, curr) => {
              // @ts-expect-error ignore
              if (prev[curr.symbol.toLowerCase()]) {
                return prev
              }
              return { ...prev, [curr.symbol.toLowerCase()]: curr }
            }, {}),
          )
        }

        if (addBalances) {
          const { account, library: provider } = context

          // fetch token balances
          tokenData = await Promise.all(
            tokenData.map(async token => {
              let balance = new BigNumber(0)
              if (account) {
                if (token.address === pseudoNativeAssetAddress) {
                  balance = await provider.getBalance(account)
                } else {
                  try {
                    const collateralService = new ERC20Service(provider, account, token.address)
                    balance = await collateralService.getCollateral(account)
                  } catch (e) {
                    return { ...token, balance: balance.toString() }
                  }
                }
              }
              return { ...token, balance: balance.toString() }
            }),
          )
        }
        if (addBridgeAllowance) {
          const { account, library: provider } = context
          // fetch token allowances
          tokenData = await Promise.all(
            tokenData.map(async token => {
              let allowance = new BigNumber(0)
              const allowanceAddress =
                token.symbol === 'DAI' ? DAI_TO_XDAI_TOKEN_BRIDGE_ADDRESS : OMNI_BRIDGE_MAINNET_ADDRESS
              if (account) {
                try {
                  const collateralService = new ERC20Service(provider, account, token.address)
                  allowance = await collateralService.allowance(account, allowanceAddress)
                } catch (e) {
                  return { ...token, allowance: allowance.toString() }
                }
              }

              return { ...token, allowance: allowance.toString() }
            }),
          )
        }
        if (!isObjectEqual(tokens, tokenData)) {
          setTokens(tokenData)
        }
      }
    }
  }

  useEffect(() => {
    fetchTokenDetails()
    // eslint-disable-next-line
  }, [context && context.library, context && context.networkId])

  return { tokens, refetch: fetchTokenDetails }
}
