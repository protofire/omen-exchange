import { BigNumber } from 'ethers/utils'
import { useEffect, useState } from 'react'

import { ERC20Service } from '../services'
import { Token } from '../util/types'

import { ConnectedWeb3Context } from './connectedWeb3'

export const useCollateralBalance = (
  collateral: Token,
  context: ConnectedWeb3Context,
): {
  collateralBalance: Maybe<BigNumber>
  fetchCollateralBalance: () => Promise<void>
} => {
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
