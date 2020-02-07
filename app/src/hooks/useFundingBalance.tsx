import { useEffect, useState } from 'react'

import { ConnectedWeb3Context } from './connectedWeb3'
import { CPKService } from '../services'
import { BigNumber } from 'ethers/utils'
import { useContracts } from './useContracts'

export const useFundingBalance = (
  marketMakerAddress: string,
  context: ConnectedWeb3Context,
): BigNumber => {
  const { library: provider, account } = context
  const { buildMarketMaker } = useContracts(context)

  const [fundingBalance, setFundingBalance] = useState<BigNumber>(new BigNumber(0))

  useEffect(() => {
    const fetchFundingBalance = async () => {
      let fundingBalance = new BigNumber(0)

      if (account) {
        const cpk = await CPKService.create(provider)
        const marketMaker = buildMarketMaker(marketMakerAddress)
        fundingBalance = await marketMaker.balanceOf(cpk.address)
      }

      setFundingBalance(fundingBalance)
    }
    fetchFundingBalance()
  }, [account, provider])

  return fundingBalance
}
