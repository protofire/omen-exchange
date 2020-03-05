import { BigNumber } from 'ethers/utils'
import { useEffect, useState } from 'react'

import { ERC20Service } from '../services'
import { Token } from '../util/types'

import { ConnectedWeb3Context } from './connectedWeb3'

export const useCollateralBalance = (collateral: Token, context: ConnectedWeb3Context): BigNumber => {
  const { account, library: provider } = context

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
