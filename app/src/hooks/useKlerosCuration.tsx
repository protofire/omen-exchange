import { useEffect, useState } from 'react'

import { KlerosCurationData, MarketMakerData } from '../util/types'

import { ConnectedWeb3Context } from './connectedWeb3'
import { useContracts } from './useContracts'

export const useKlerosCuration = (
  marketMakerData: MarketMakerData,
  context: ConnectedWeb3Context,
): Maybe<KlerosCurationData> => {
  const { kleros } = useContracts(context)
  const [data, setData] = useState<Maybe<KlerosCurationData>>(null)

  useEffect(() => {
    ;(async () => {
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
    })()
  }, [kleros, marketMakerData])

  return data
}
