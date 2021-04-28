import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React, { useEffect, useState } from 'react'

import { STANDARD_DECIMALS } from '../common/constants'
import { useCollateralBalance, useConnectedWeb3Context, useTokens } from '../hooks'
import { ERC20Service, XdaiService } from '../services'
import { getLogger } from '../util/logger'
import { getNativeAsset, getToken, networkIds } from '../util/networks'
import { formatBigNumber, formatNumber } from '../util/tools'

const logger = getLogger('Hooks::ConnectedBalance')

export interface ConnectedBalanceContext {
  claimState: boolean
  unclaimedDaiAmount: BigNumber
  unclaimedOmenAmount: BigNumber
  ethBalance: BigNumber
  formattedEthBalance: string
  daiBalance: BigNumber
  formattedDaiBalance: string
  xOmenBalance: BigNumber
  xDaiBalance: BigNumber
  formattedxDaiBalance: string
  formattedxOmenBalance: string
  formattedOmenBalance: string
  omenBalance: BigNumber
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

  const [claimState, setClaimState] = useState<boolean>(false)
  const [unclaimedDaiAmount, setUnclaimedDaiAmount] = useState<BigNumber>(Zero)
  const [unclaimedOmenAmount, setUnclaimedOmenAmount] = useState<BigNumber>(Zero)
  const [xOmenBalance, setxOmenBalance] = useState<BigNumber>(Zero)

  const { refetch, tokens } = useTokens(context.rawWeb3Context, true, true)

  const ethBalance = new BigNumber(
    tokens.filter(token => token.symbol === getNativeAsset(context.rawWeb3Context.networkId).symbol)[0]?.balance || '',
  )
  const daiBalance = new BigNumber(tokens.filter(token => token.symbol === 'DAI')[0]?.balance || '')

  const nativeAsset = getNativeAsset(context.networkId)

  const { collateralBalance, fetchCollateralBalance } = useCollateralBalance(nativeAsset, context)
  const xDaiBalance = collateralBalance || Zero

  const omenBalance = new BigNumber(tokens.filter(token => token.symbol === 'OMN')[0]?.balance || '')

  const omenToken = getToken(100, 'omn')

  // const { collateralBalance: omenCollateral, fetchCollateralBalance: fetchOmenBalance } = useCollateralBalance(
  //   omenToken,
  //   context,
  // )
  // const omenBalance = omenCollateral || Zero
  // const formattedxOmenBalance = `${formatBigNumber(omenBalance, omenToken.decimals, 2)}`
  //console.log(formattedxOmenBalance)
  //this above triggers infinite re render i tested it and found out that omenToken/Collateral inside useCollateralBalance triggers useEffect for some reason not apparent to me

  const fetchxOmenBalance = async () => {
    if (!context.account) return
    let omenCollateral = new BigNumber(0)

    const collateralService = new ERC20Service(context.library, context.account, omenToken.address)
    omenCollateral = await collateralService.getCollateral(context.account)

    setxOmenBalance(omenCollateral)
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
        console.log(formatBigNumber(aggregatedDai, 18, 2))
      } else {
        console.log('here')
        setUnclaimedDaiAmount(Zero)
      }
      if (omenTransactions && omenTransactions.length) {
        const aggregatedOmen = aggregator(omenTransactions)
        console.log(formatBigNumber(aggregatedOmen, 18, 2))
        setUnclaimedOmenAmount(aggregatedOmen)
      } else {
        setUnclaimedOmenAmount(Zero)
      }
    }
  }

  const fetchBalances = async () => {
    try {
      await Promise.all([fetchUnclaimedAssets(), fetchCollateralBalance(), refetch(), fetchxOmenBalance()])
    } catch (e) {
      logger.log(e.message)
    }
  }

  useEffect(() => {
    if (relay) {
      fetchBalances()
    } else {
      setUnclaimedDaiAmount(Zero)
      setClaimState(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, networkId])

  const value = {
    claimState,
    unclaimedDaiAmount,
    unclaimedOmenAmount,
    ethBalance,
    formattedEthBalance: formatNumber(formatBigNumber(ethBalance, STANDARD_DECIMALS, STANDARD_DECIMALS), 3),
    daiBalance,
    formattedDaiBalance: formatNumber(formatBigNumber(daiBalance, STANDARD_DECIMALS, STANDARD_DECIMALS)),
    xDaiBalance,
    formattedxDaiBalance: formatBigNumber(xDaiBalance, nativeAsset.decimals, 2),
    fetchBalances,
    formattedOmenBalance: formatNumber(formatBigNumber(omenBalance, STANDARD_DECIMALS, STANDARD_DECIMALS), 3),
    omenBalance,
    xOmenBalance,
    formattedxOmenBalance: formatBigNumber(xOmenBalance, omenToken.decimals, 2),
  }

  return <ConnectedBalanceContext.Provider value={value}>{props.children}</ConnectedBalanceContext.Provider>
}
