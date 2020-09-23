import { BigNumber } from 'ethers'
import { useEffect, useState } from 'react'

import { CPKService } from '../services'

import { ConnectedWeb3Context } from './connectedWeb3'
import { useContracts } from './useContracts'

export const useFundingBalance = (marketMakerAddress: string, context: ConnectedWeb3Context): Maybe<BigNumber> => {
  const { account, library: provider } = context
  const { buildMarketMaker } = useContracts(context)

  const [fundingBalance, setFundingBalance] = useState<Maybe<BigNumber>>(null)

  useEffect(() => {
    const fetchFundingBalance = async () => {
      let fundingBalance = BigNumber.from(0)

      if (account) {
        const cpk = await CPKService.create(provider)
        const marketMaker = buildMarketMaker(marketMakerAddress)
        fundingBalance = await marketMaker.balanceOf(cpk.address)
      }

      setFundingBalance(fundingBalance)
    }
    fetchFundingBalance()
  }, [account, provider, buildMarketMaker, marketMakerAddress])

  return fundingBalance
}
