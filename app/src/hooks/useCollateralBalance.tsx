import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers/utils'
import { useEffect, useState } from 'react'

import { ERC20Service } from '../services'
import { Token } from '../util/types'

export const useCollateralBalance = (
  collateral: Token,
): {
  collateralBalance: Maybe<BigNumber>
  fetchCollateralBalance: () => Promise<void>
} => {
  const context = useWeb3React()
  const { account, library: provider } = context

  const [collateralBalance, setCollateralBalance] = useState<Maybe<BigNumber>>(null)

  const fetchCollateralBalance = async () => {
    let collateralBalance = new BigNumber(0)
    if (account) {
      const collateralService = new ERC20Service(provider, account, collateral.address)
      collateralBalance = await collateralService.getCollateral(account)
    }

    setCollateralBalance(collateralBalance)
  }

  useEffect(() => {
    fetchCollateralBalance()
    // eslint-disable-next-line
  }, [account, provider, collateral])

  return { collateralBalance, fetchCollateralBalance }
}
