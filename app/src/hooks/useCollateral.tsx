import { useEffect, useState } from 'react'

import { ConnectedWeb3Context } from './connectedWeb3'
import { getTokenFromAddress } from '../util/addresses'
import { ERC20Service } from '../services'
import { Token } from '../util/types'

const getTokenFromAddressIfExists = (
  networkId: number,
  collateralAddress: string,
): Maybe<Token> => {
  try {
    return getTokenFromAddress(networkId, collateralAddress)
  } catch (err) {
    return null
  }
}

export const useCollateral = (
  collateralAddress: string,
  context: ConnectedWeb3Context,
): Maybe<Token> => {
  const [collateral, setCollateral] = useState<Maybe<Token>>(null)

  useEffect(() => {
    let isSubscribed = true

    const fetchIsValidErc20 = async () => {
      let collateralData = getTokenFromAddressIfExists(context.networkId, collateralAddress)

      // If the address doesn't belong to a knowToken, we fetch its metadata
      if (!collateralData) {
        const erc20Service = new ERC20Service(context.library, collateralAddress)
        const isValidErc20 = await erc20Service.isValidErc20()
        if (isValidErc20) {
          collateralData = await erc20Service.getProfileSummary()
        }
      }

      if (isSubscribed) setCollateral(collateralData)
    }

    fetchIsValidErc20()

    return () => {
      isSubscribed = false
    }
  }, [context, collateralAddress])

  return collateral
}
