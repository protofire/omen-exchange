import { useEffect, useState } from 'react'

import { getLogger } from '../util/logger'
import { KlerosCurationData, MarketMakerData, Status } from '../util/types'

import { ConnectedWeb3Context } from './connectedWeb3'
import { useContracts } from './useContracts'

const logger = getLogger('KlerosCuration')

type Result = {
  data: Maybe<KlerosCurationData>
  status: Status
  error: Maybe<Error>
}

export const useKlerosCuration = (marketMakerData: MarketMakerData, context: ConnectedWeb3Context): Result => {
  const { kleros } = useContracts(context)
  const [data, setData] = useState<Maybe<KlerosCurationData>>(null)
  const [error, setError] = useState<Maybe<Error>>(null)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
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
  }, [kleros, marketMakerData])

  return {
    data,
    status: error ? Status.Error : loading ? Status.Loading : Status.Ready,
    error,
  }
}
