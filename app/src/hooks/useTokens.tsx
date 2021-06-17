import { useQuery } from '@apollo/react-hooks'
import { BigNumber } from 'ethers/utils'
import gql from 'graphql-tag'
import { useEffect, useState } from 'react'

import { DAI_TO_XDAI_TOKEN_BRIDGE_ADDRESS, OMNI_BRIDGE_MAINNET_ADDRESS } from '../common/constants'
import { ERC20Service } from '../services'
import { getLogger } from '../util/logger'
import { getNativeAsset, getOmenTCRListId, getTokensByNetwork, pseudoNativeAssetAddress } from '../util/networks'
import { getImageUrl } from '../util/token'
import { isObjectEqual } from '../util/tools'
import { Token } from '../util/types'

import { ConnectedWeb3Context } from './connectedWeb3'

const logger = getLogger('useTokens')

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

export const useTokens = (
  context: ConnectedWeb3Context,
  addNativeAsset?: boolean,
  addBalances?: boolean,
  relay?: boolean,
  addBridgeAllowance?: boolean,
) => {
  const defaultTokens = getTokensByNetwork(context.networkId)
  if (addNativeAsset) {
    defaultTokens.unshift(getNativeAsset(context.networkId, relay))
  }
  const [tokens, setTokens] = useState<Token[]>(defaultTokens)

  const omenTCRListId = getOmenTCRListId(context.networkId)

  const { data, error, loading, refetch } = useQuery<GraphResponse>(query, {
    notifyOnNetworkStatusChange: true,
    skip: false,
    variables: { listId: omenTCRListId.toString() },
  })

  useEffect(() => {
    const fetchTokenDetails = async () => {
      if (!error && !loading && data?.tokenLists) {
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
    fetchTokenDetails()
    // eslint-disable-next-line
  }, [loading])

  useEffect(() => {
    const reload = async () => {
      try {
        await refetch()
      } catch (e) {
        logger.log(e.message)
      }
    }
    reload()
    // eslint-disable-next-line
  }, [context.library, context.networkId])

  return { tokens, refetch }
}
