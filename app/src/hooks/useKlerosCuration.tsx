import { useCallback, useEffect, useState } from 'react'

import { getLogger } from '../util/logger'
import { KlerosCurationData, MarketMakerData, Status } from '../util/types'

import { ConnectedWeb3Context } from './connectedWeb3'
import { useContracts } from './useContracts'
import { useGraphMeta } from './useGraphMeta'

const logger = getLogger('KlerosCuration')

type Result = {
  data: Maybe<KlerosCurationData>
  status: Status
  error: Maybe<Error>
}

export const useKlerosCuration = (
  marketMakerData: MarketMakerData,
  context: ConnectedWeb3Context,
  fetchGraphMarketMakerData: () => Promise<void>,
): Result => {
  const { kleros } = useContracts(context)
  const [data, setData] = useState<Maybe<KlerosCurationData>>(null)
  const [error, setError] = useState<Maybe<Error>>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const { waitForBlockToSync } = useGraphMeta()

  const fetchData = useCallback(() => {
    ;(async () => {
      try {
        setLoading(true)

        fetchGraphMarketMakerData()

        const [
          listingCriteriaURL,
          submissionDeposit,
          challengePeriodDuration,
          submissionBaseDeposit,
          removalBaseDeposit,
          marketVerificationData,
        ] = await Promise.all([
          kleros.getListingCriteriaURL(),
          kleros.getSubmissionDeposit(),
          kleros.getChallengePeriodDuration(),
          kleros.getSubmissionBaseDeposit(),
          kleros.getRemovalBaseDeposit(),
          kleros.getMarketState(marketMakerData),
        ])

        setData({
          listingCriteriaURL,
          submissionDeposit: submissionDeposit.toString(),
          challengePeriodDuration: challengePeriodDuration.toString(),
          submissionBaseDeposit: submissionBaseDeposit.toString(),
          removalBaseDeposit: removalBaseDeposit.toString(),
          marketVerificationData,
          ovmAddress: kleros.omenVerifiedMarkets.address,
        })
        setError(null)
      } catch (_err) {
        const errorMessage = 'Error fetching market validity curation data.'
        logger.error(errorMessage)
        setError(new Error(errorMessage))
      } finally {
        setLoading(false)
      }
    })()
    // eslint-disable-next-line
  }, [kleros, marketMakerData])

  useEffect(() => {
    if (loading || !kleros || data || error) return

    fetchData()
  }, [data, error, fetchData, kleros, loading])

  // Setup event listener after fetching data.
  useEffect(() => {
    if (!kleros || error) return

    kleros.omenVerifiedMarkets.on('ItemStatusChange', async (...args) => {
      const event = args.pop()
      await waitForBlockToSync(event.blockNumber)
      fetchData()
    })

    kleros.omenVerifiedMarkets.on('Dispute', async (...args) => {
      const event = args.pop()
      await waitForBlockToSync(event.blockNumber)
      fetchData()
    })

    return () => {
      kleros.omenVerifiedMarkets.removeAllListeners('ItemStatusChange')
      kleros.omenVerifiedMarkets.removeAllListeners('Dispute')
    }
    // eslint-disable-next-line
  }, [error, fetchData, kleros])

  return {
    data,
    status: error ? Status.Error : loading ? Status.Loading : Status.Ready,
    error,
  }
}
