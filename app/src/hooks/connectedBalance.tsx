import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React, { useEffect, useState } from 'react'

import { STANDARD_DECIMALS } from '../common/constants'
import { useConnectedWeb3Context, useTokens } from '../hooks'
import { XdaiService } from '../services'
import { getLogger } from '../util/logger'
import { bridgeTokensList, getNativeAsset, networkIds } from '../util/networks'
import { formatBigNumber, formatNumber } from '../util/tools'
import { KnownTokenValue, Token } from '../util/types'

const logger = getLogger('Hooks::ConnectedBalance')

export interface ConnectedBalanceContext {
  nativeBalance: BigNumber
  formattedNativeBalance: string
  daiBalance: BigNumber
  xOmenBalance: BigNumber
  xDaiBalance: BigNumber
  formattedxDaiBalance: string
  omenBalance: BigNumber
  mainnetTokens: Token[]
  xDaiTokens: Token[]
  arrayOfClaimableTokenBalances: KnownTokenValue[]
  fetchBalances: () => Promise<void>
}

const ConnectedBalanceContext = React.createContext<Maybe<ConnectedBalanceContext>>(null)

/**
 * This hook can only be used by components under the `ConnectedWeb3` component. Otherwise it will throw.
 */
export const useConnectedBalanceContext = () => {
  const context = React.useContext(ConnectedBalanceContext)

  if (!context) {
    throw new Error('Component rendered outside the provider tree')
  }

  return context
}

interface Props {
  children?: React.ReactNode
}
/**
 * Component used to render components that depend on Web3 being available. These components can then
 * `useConnectedWeb3Context` safely to get web3 stuff without having to null check it.
 */
export const ConnectedBalance: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { relay } = context
  const { account, networkId } = context.rawWeb3Context

  const [arrayOfClaimableTokenBalances, setArrayOfClaimableTokenBalances] = useState<KnownTokenValue[]>([])

  // mainnet balances
  const { refetch, tokens: mainnetTokens } = useTokens(context.rawWeb3Context, true, true, false, true)

  //xDai balances
  const { refetch: fetchXdaiTokens, tokens: xDaiTokens } = useTokens(context, true, true)

  const nativeBalance = new BigNumber(
    mainnetTokens.filter(token => token.symbol === getNativeAsset(networkId).symbol)[0]?.balance || '',
  )
  //mainnet balances
  const daiBalance = new BigNumber(mainnetTokens.filter(token => token.symbol === 'DAI')[0]?.balance || '')
  const omenBalance = new BigNumber(mainnetTokens.filter(token => token.symbol === 'OMN')[0]?.balance || '')

  // relay balances
  const nativeAsset = getNativeAsset(context.networkId)

  // xdai token balance
  const xDaiBalance = new BigNumber(xDaiTokens.filter(token => token.symbol === 'xDAI')[0]?.balance || '')
  const xOmenBalance = new BigNumber(xDaiTokens.filter(token => token.symbol === 'OMN')[0]?.balance || '')

  const fetchUnclaimedAssets = async () => {
    const aggregator = (array: any) => {
      return array.reduce((prev: BigNumber, { value }: any) => prev.add(value), Zero)
    }
    const arrayOfBalances: KnownTokenValue[] = []
    if (account && networkId === networkIds.MAINNET) {
      const xDaiService = new XdaiService(context.library)
      const daiTransactions = await xDaiService.fetchXdaiTransactionData()

      if (daiTransactions && daiTransactions.length) {
        const aggregatedDai: BigNumber = aggregator(daiTransactions)
        arrayOfBalances.push({ token: 'dai', value: aggregatedDai })
      }
      for (const token of bridgeTokensList) {
        if (token !== 'dai') {
          const transactions = await xDaiService.fetchOmniTransactionData(token)
          if (transactions.length !== 0) {
            const aggregated: BigNumber = aggregator(transactions)
            arrayOfBalances.push({ token: token, value: aggregated })
          }
        }
      }
    }
    setArrayOfClaimableTokenBalances(arrayOfBalances)
  }

  const fetchBalances = async () => {
    try {
      await Promise.all([fetchUnclaimedAssets(), refetch(), fetchXdaiTokens()])
    } catch (e) {
      logger.log(e.message)
    }
  }

  useEffect(() => {
    setArrayOfClaimableTokenBalances([])
    if (relay) fetchBalances()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, networkId])

  const value = {
    nativeBalance,
    formattedNativeBalance: formatNumber(
      formatBigNumber(nativeBalance, STANDARD_DECIMALS, STANDARD_DECIMALS),
      !relay && networkId === networkIds.XDAI ? 2 : 3,
    ),
    daiBalance,
    xDaiBalance,
    formattedxDaiBalance: formatBigNumber(xDaiBalance, nativeAsset.decimals, 2),
    fetchBalances,
    omenBalance,
    xOmenBalance,
    mainnetTokens,
    xDaiTokens,
    arrayOfClaimableTokenBalances,
  }

  return <ConnectedBalanceContext.Provider value={value}>{props.children}</ConnectedBalanceContext.Provider>
}
