import axios from 'axios'
import { useState } from 'react'

import { DAI_TO_XDAI_TOKEN_BRIDGE_ADDRESS, OMNI_BRIDGE_MAINNET_ADDRESS } from '../common/constants'
import { getMultiCallConfig, multicall } from '../util/multicall'
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

type Status = {
  active: boolean
}

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

  const fetchTokenDetails = async (status?: Status) => {
    const active = !status || status.active
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

        const { account } = context

        // aggregate call array
        const calls = []

        // helpers to access aggregate results
        const getBalanceKey = (address: string) => `${address}-balance`
        const getAllowanceKey = (address: string) => `${address}-allowance`

        // iterate over tokens and add calls to aggregate array
        for (let i = 0; i < tokenData.length; i++) {
          const token = tokenData[i]
          if (account) {
            const balanceKey = getBalanceKey(token.address)
            if (token.address === pseudoNativeAssetAddress) {
              if (addBalances) {
                // use getEthBalance helper in multicall contract
                calls.push({
                  target: getMultiCallConfig(context.networkId).multicallAddress,
                  call: ['getEthBalance(address)(uint256)', account],
                  returns: [[balanceKey]],
                })
              }
            } else {
              if (addBalances) {
                calls.push({
                  target: token.address,
                  call: ['balanceOf(address)(uint256)', account],
                  returns: [[balanceKey]],
                })
              }
              if (addBridgeAllowance) {
                const allowanceAddress =
                  token.symbol === 'DAI' ? DAI_TO_XDAI_TOKEN_BRIDGE_ADDRESS : OMNI_BRIDGE_MAINNET_ADDRESS
                calls.push({
                  target: token.address,
                  call: ['allowance(address,address)(uint256)', account, allowanceAddress],
                  returns: [[getAllowanceKey(token.address)]],
                })
              }
            }
          }
        }

        if (calls.length) {
          const response = await multicall(calls, context.networkId)
          tokenData = tokenData.map(token => {
            const results = response.results.original
            const balance = results[getBalanceKey(token.address)]
            const allowance = results[getAllowanceKey(token.address)]
            return { ...token, balance, allowance }
          })
        }

        if (!isObjectEqual(tokens, tokenData)) {
          if (active) {
            setTokens(tokenData)
          }
        }
      }
    }
  }

  return { tokens, refetch: fetchTokenDetails }
}
