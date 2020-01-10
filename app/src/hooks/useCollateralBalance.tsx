import { useEffect, useState } from 'react'

import { ConnectedWeb3Context } from './connectedWeb3'
import { ERC20Service } from '../services'
import { Token } from '../util/types'
import { BigNumber } from 'ethers/utils'

export const useCollateralBalance = (
  collateral: Token,
  context: ConnectedWeb3Context,
): BigNumber => {
  const { library: provider, account } = context

  const [collateralBalance, setCollateralBalance] = useState<BigNumber>(new BigNumber(0))

  useEffect(() => {
    const isSubscribed = true

    const fetchCollateralBalance = async () => {
      let collateralBalance = new BigNumber(0)
      if (account) {
        const collateralService = new ERC20Service(provider, account, collateral.address)
        collateralBalance = await collateralService.getCollateral(account)
      }

      if (isSubscribed) {
        setCollateralBalance(collateralBalance)
      }
    }
    fetchCollateralBalance()
  }, [account, provider, collateral])

  return collateralBalance
}
