import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers/utils'
import { useEffect, useState } from 'react'

import { useConnectedCPKContext } from './connectedCpk'
import { useContracts } from './useContracts'

export const useFundingBalance = (
  marketMakerAddress: string,
): {
  fundingBalance: Maybe<BigNumber>
  fetchFundingBalance: () => Promise<void>
} => {
  const context = useWeb3React()
  const { account, library: provider } = context
  const { buildMarketMaker } = useContracts()
  const cpk = useConnectedCPKContext()

  const [fundingBalance, setFundingBalance] = useState<Maybe<BigNumber>>(null)

  const fetchFundingBalance = async () => {
    let fundingBalance = new BigNumber(0)

    if (account && cpk) {
      const marketMaker = buildMarketMaker(marketMakerAddress)
      fundingBalance = await marketMaker.balanceOf(cpk.address)
    }

    setFundingBalance(fundingBalance)
  }

  useEffect(() => {
    fetchFundingBalance()
    // eslint-disable-next-line
  }, [account, provider, buildMarketMaker, marketMakerAddress, cpk])

  return { fundingBalance, fetchFundingBalance }
}
