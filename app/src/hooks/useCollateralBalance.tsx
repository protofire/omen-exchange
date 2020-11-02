import { BigNumber } from 'ethers/utils'
import { useEffect, useState } from 'react'

import { ERC20Service } from '../services'
import { pseudoEthAddress } from '../util/networks'
import { Token } from '../util/types'

import { ConnectedWeb3Context } from './connectedWeb3'

export const useCollateralBalance = (collateral: Token, context: ConnectedWeb3Context): Maybe<BigNumber> => {
  const { account, library: provider } = context

  const [collateralBalance, setCollateralBalance] = useState<Maybe<BigNumber>>(null)

  useEffect(() => {
    const isSubscribed = true

    const fetchCollateralBalance = async () => {
      let collateralBalance = new BigNumber(0)
      if (account) {
        if (collateral.address === pseudoEthAddress) {
          collateralBalance = await provider.getBalance(account)
        } else {
          const collateralService = new ERC20Service(provider, account, collateral.address)
          collateralBalance = await collateralService.getCollateral(account)
        }
      }

      if (isSubscribed) {
        setCollateralBalance(collateralBalance)
      }
    }
    fetchCollateralBalance()
  }, [account, provider, collateral])

  return collateralBalance
}
