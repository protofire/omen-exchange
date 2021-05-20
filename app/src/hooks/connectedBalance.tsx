import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React, { useEffect, useState } from 'react'

import { DAI_TO_XDAI_TOKEN_BRIDGE_ADDRESS, OMNI_BRIDGE_MAINNET_ADDRESS, STANDARD_DECIMALS } from '../common/constants'
import { useConnectedWeb3Context, useTokens } from '../hooks'
import { ERC20Service, XdaiService } from '../services'
import { getLogger } from '../util/logger'
import { bridgeTokensList, getNativeAsset, getToken, networkIds } from '../util/networks'
import { formatBigNumber, formatNumber } from '../util/tools'
import { Token } from '../util/types'

const logger = getLogger('Hooks::ConnectedBalance')

export interface ConnectedBalanceContext {
  unclaimedDaiAmount: BigNumber
  unclaimedOmenAmount: BigNumber
  nativeBalance: BigNumber
  formattedNativeBalance: string
  daiBalance: BigNumber
  formattedDaiBalance: string
  xOmenBalance: BigNumber
  xDaiBalance: BigNumber
  formattedxDaiBalance: string
  formattedxOmenBalance: string
  formattedOmenBalance: string
  omenBalance: BigNumber
  mainnetTokens: Token[]
  xDaiTokens: Token[]
  fetchBalances: () => Promise<void>
  allowanceData: any
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

  const [unclaimedDaiAmount, setUnclaimedDaiAmount] = useState<BigNumber>(Zero)
  const [unclaimedOmenAmount, setUnclaimedOmenAmount] = useState<BigNumber>(Zero)
  const [allowanceData, setAllowanceData] = useState()

  // mainnet balances
  const { refetch, tokens: mainnetTokens } = useTokens(context.rawWeb3Context, true, true)
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

  const fetchAllowanceData = async () => {
    const tokenAllowanceData = await Promise.all(
      bridgeTokensList.map(async token => {
        const data = getToken(networkIds.MAINNET, token)
        let allowance: BigNumber = Zero
        const allowanceAddress = token === 'dai' ? DAI_TO_XDAI_TOKEN_BRIDGE_ADDRESS : OMNI_BRIDGE_MAINNET_ADDRESS
        if (account) {
          try {
            const collateralService = new ERC20Service(context.rawWeb3Context.library, account, data.address)
            allowance = await collateralService.allowance(account, allowanceAddress)
          } catch {
            console.log('here')
            return { [token]: allowance }
          }
        }
        return { [token]: allowance }
      }),
    )
    console.log(tokenAllowanceData)
    setAllowanceData(tokenAllowanceData.reduce((a, c) => Object.assign(a, c), Object.create(null)))
  }

  const fetchUnclaimedAssets = async () => {
    const aggregator = (array: any) => {
      return array.reduce((prev: BigNumber, { value }: any) => prev.add(value), Zero)
    }
    if (account && networkId === networkIds.MAINNET) {
      const xDaiService = new XdaiService(context.library)
      const daiTransactions = await xDaiService.fetchXdaiTransactionData()

      const omenTransactions = await xDaiService.fetchOmniTransactionData()

      if (daiTransactions && daiTransactions.length) {
        const aggregatedDai = aggregator(daiTransactions)
        setUnclaimedDaiAmount(aggregatedDai)
      } else {
        setUnclaimedDaiAmount(Zero)
      }
      if (omenTransactions && omenTransactions.length) {
        const aggregatedOmen = aggregator(omenTransactions)

        setUnclaimedOmenAmount(aggregatedOmen)
      } else {
        setUnclaimedOmenAmount(Zero)
      }
    }
  }

  const fetchBalances = async () => {
    try {
      await Promise.all([fetchUnclaimedAssets(), refetch(), fetchXdaiTokens(), fetchAllowanceData()])
    } catch (e) {
      logger.log(e.message)
    }
  }

  useEffect(() => {
    fetchAllowanceData()
    if (relay) {
      fetchBalances()
    } else {
      setUnclaimedDaiAmount(Zero)
      setUnclaimedOmenAmount(Zero)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, networkId])
  console.log(allowanceData)

  const value = {
    unclaimedDaiAmount,
    unclaimedOmenAmount,
    nativeBalance,
    formattedNativeBalance: formatNumber(
      formatBigNumber(nativeBalance, STANDARD_DECIMALS, STANDARD_DECIMALS),
      !relay && networkId === networkIds.XDAI ? 2 : 3,
    ),
    daiBalance,
    formattedDaiBalance: formatNumber(formatBigNumber(daiBalance, STANDARD_DECIMALS, STANDARD_DECIMALS)),
    xDaiBalance,
    formattedxDaiBalance: formatBigNumber(xDaiBalance, nativeAsset.decimals, 2),
    fetchBalances,
    formattedOmenBalance: formatNumber(formatBigNumber(omenBalance, STANDARD_DECIMALS, STANDARD_DECIMALS), 2),
    omenBalance,
    xOmenBalance,
    formattedxOmenBalance: formatBigNumber(xOmenBalance, STANDARD_DECIMALS, 2),
    mainnetTokens,
    xDaiTokens,
    allowanceData,
  }

  return <ConnectedBalanceContext.Provider value={value}>{props.children}</ConnectedBalanceContext.Provider>
}
