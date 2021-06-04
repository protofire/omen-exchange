import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import { useEffect, useState } from 'react'

import { STANDARD_DECIMALS } from '../common/constants'
import { XdaiService } from '../services'
import { getLogger } from '../util/logger'
import { getNativeAsset, getToken, networkIds } from '../util/networks'
import { formatBigNumber, formatNumber } from '../util/tools'

import { fetchBalance } from './useCollateralBalance'

const logger = getLogger('Hooks::ConnectedBalance')

export interface ConnectedBalance {
  unclaimedDaiAmount: BigNumber
  unclaimedOmenAmount: BigNumber
  nativeBalance: BigNumber
  formattedNativeBalance: string
  daiBalance: BigNumber
  formattedDaiBalance: string
  xOmenBalance: BigNumber
  formattedxOmenBalance: string
  formattedOmenBalance: string
  fetched: boolean
  omenBalance: BigNumber
  fetchBalances: () => Promise<void>
}

interface StateParam {
  active: boolean
}

export const useBalance = (props: any) => {
  const context = props

  const [unclaimedDaiAmount, setUnclaimedDaiAmount] = useState<BigNumber>(Zero)
  const [unclaimedOmenAmount, setUnclaimedOmenAmount] = useState<BigNumber>(Zero)

  const [fetched, setFetched] = useState(false)
  const [nativeBalance, setNativeBalance] = useState<BigNumber>(Zero)
  const [daiBalance, setDaiBalance] = useState<BigNumber>(Zero)
  const [omenBalance, setOmenBalance] = useState<BigNumber>(Zero)

  const [xOmenBalance, setxOmenBalance] = useState<BigNumber>(Zero)

  const fetchTokenBalances = async (state?: StateParam) => {
    if (context) {
      const requests = []

      const active = (fn: () => void) => {
        // race condition prevention
        if (!state || state.active) {
          fn()
        }
      }

      if (context.rawWeb3Context.networkId !== networkIds.XDAI) {
        requests.push(async () => {
          const daiCollateralBalance = await fetchBalance(
            getToken(context.rawWeb3Context.networkId, 'dai'),
            context.rawWeb3Context,
          )
          active(() => setDaiBalance(daiCollateralBalance))
        })
      }

      requests.push(async () => {
        const omnCollateralBalance = await fetchBalance(
          getToken(context.rawWeb3Context.networkId, 'omn'),
          context.rawWeb3Context,
        )
        active(() => setOmenBalance(omnCollateralBalance))
      })

      requests.push(async () => {
        const nativeCollateralBalance = await fetchBalance(getNativeAsset(context.networkId), context)
        active(() => setNativeBalance(nativeCollateralBalance))
      })

      if (context.rawWeb3Context.networkId === networkIds.XDAI) {
        requests.push(async () => {
          const xOmenCollateralBalance = await fetchBalance(getToken(context.networkId, 'omn'), context)
          active(() => setxOmenBalance(xOmenCollateralBalance))
        })
      }

      await Promise.all(requests.map(request => request()))
    }
  }

  const fetchUnclaimedAssets = async () => {
    if (context && context.relay) {
      const { account, networkId } = context
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
  }

  const fetchBalances = async (state?: StateParam) => {
    try {
      await Promise.all([fetchTokenBalances(state), fetchUnclaimedAssets()])
      setFetched(true)
    } catch (e) {
      logger.log(e.message)
    }
  }

  useEffect(() => {
    const state = { active: true }
    if (context) {
      fetchBalances(state)
    } else {
      setUnclaimedDaiAmount(Zero)
      setUnclaimedOmenAmount(Zero)
    }
    return () => {
      state.active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context?.account, context?.networkId, context?.relay, context?.library, context?.rawWeb3Context.networkId])

  return {
    unclaimedDaiAmount,
    unclaimedOmenAmount,
    nativeBalance,
    formattedNativeBalance: formatNumber(
      formatBigNumber(nativeBalance, STANDARD_DECIMALS, STANDARD_DECIMALS),
      context && context.networkId === networkIds.XDAI ? 2 : 3,
    ),
    daiBalance,
    formattedDaiBalance: formatNumber(formatBigNumber(daiBalance, STANDARD_DECIMALS, STANDARD_DECIMALS)),
    fetchBalances,
    formattedOmenBalance: formatNumber(formatBigNumber(omenBalance, STANDARD_DECIMALS, STANDARD_DECIMALS), 2),
    fetched,
    omenBalance,
    xOmenBalance,
    formattedxOmenBalance: formatBigNumber(xOmenBalance, STANDARD_DECIMALS, 2),
  }
}
