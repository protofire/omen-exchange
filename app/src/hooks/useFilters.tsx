import { useInterval } from '@react-corekit/use-interval'
import { ethers } from 'ethers'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { MAX_MARKET_FEE } from '../common/constants'
import { buildQueryMarkets, queryMyMarkets } from '../queries/markets_home'
import { CPKService } from '../services'
import { getLogger } from '../util/logger'
import { getArbitratorsByNetwork } from '../util/networks'
import { MarketFilters, MarketStates } from '../util/types'

import { useConnectedWeb3Context } from './connectedWeb3'

export const useFilters = (params: Omit<MarketFilters, 'templateId'>, pageSize: number) => {
  const { account, library: provider, networkId } = useConnectedWeb3Context()
  const [cpkAddress, setCpkAddress] = useState<Maybe<string>>(null)

  const calcNow = useCallback(() => (Date.now() / 1000).toFixed(0), [])
  const [now, setNow] = useState<string>(calcNow())

  const [filter, setFilter] = useState<MarketFilters>({
    templateId: null,
    ...params,
  })

  const feeBN = ethers.utils.parseEther('' + MAX_MARKET_FEE / Math.pow(10, 2))
  const knownArbitrators = useMemo(() => getArbitratorsByNetwork(networkId).map(x => x.address), [networkId])
  const fetchMyMarkets = filter.state === MarketStates.myMarkets
  const logger = getLogger('MarketHomeContainer::useFiltersHook')

  const marketsQuery = useMemo(
    () =>
      fetchMyMarkets
        ? queryMyMarkets
        : buildQueryMarkets({
            whitelistedTemplateIds: true,
            whitelistedCreators: false,
            ...filter,
            networkId,
          }),
    [networkId, filter, fetchMyMarkets],
  )

  useInterval(() => setNow(calcNow), 1000 * 60 * 5)

  useEffect(() => {
    const getCpkAddress = async () => {
      try {
        const cpk = await CPKService.create(provider)
        setCpkAddress(cpk.address)
      } catch (e) {
        logger.error('Could not get address of CPK', e.message)
      }
    }

    if (account) {
      getCpkAddress()
    }
  }, [provider, account, logger])

  const marketsQueryVariables = useMemo(() => {
    return {
      first: pageSize,
      skip: 0,
      accounts: cpkAddress ? [cpkAddress] : null,
      account: cpkAddress && cpkAddress.toLowerCase(),
      fee: feeBN.toString(),
      now: +now,
      knownArbitrators,
      ...filter,
    }
  }, [pageSize, cpkAddress, feeBN, now, knownArbitrators, filter])

  return { filter, setFilter, marketsQuery, marketsQueryVariables, fetchMyMarkets }
}
