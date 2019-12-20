import { useEffect, useState } from 'react'

import { ConnectedWeb3Context } from './connectedWeb3'
import { getTokenFromAddress } from '../util/networks'
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
): { collateral: Maybe<Token>; errorMessage: Maybe<string> } => {
  const [collateral, setCollateral] = useState<Maybe<Token>>(null)
  const [errorMessage, setErrorMessage] = useState<Maybe<string>>(null)

  useEffect(() => {
    let isSubscribed = true

    const fetchIsValidErc20 = async () => {
      if (!collateralAddress) {
        return
      }

      let newCollateral = getTokenFromAddressIfExists(context.networkId, collateralAddress)
      let newErrorMessage: Maybe<string> = null

      // If the address doesn't belong to a knowToken, we fetch its metadata
      if (!newCollateral) {
        const erc20Service = new ERC20Service(context.library, collateralAddress)
        const isValidErc20 = await erc20Service.isValidErc20()
        if (isValidErc20) {
          newCollateral = await erc20Service.getProfileSummary()
        } else {
          newErrorMessage = `The address is not a valid Erc20 token.`
        }
      }

      if (isSubscribed) {
        setCollateral(newCollateral)
        setErrorMessage(newErrorMessage)
      }
    }

    fetchIsValidErc20()

    return () => {
      isSubscribed = false
    }
  }, [context, collateralAddress])

  return {
    collateral,
    errorMessage,
  }
}
