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
): { collateral: Maybe<Token>; messageError: string } => {
  const [collateral, setCollateral] = useState<Maybe<Token>>(null)
  const [messageError, setMessageError] = useState<string>('')

  useEffect(() => {
    let isSubscribed = true

    const fetchIsValidErc20 = async () => {
      let collateralData = null
      let messageErrorData = ''
      if (collateralAddress) {
        collateralData = getTokenFromAddressIfExists(context.networkId, collateralAddress)

        // If the address doesn't belong to a knowToken, we fetch its metadata
        if (!collateralData) {
          const erc20Service = new ERC20Service(context.library, collateralAddress)
          const isValidErc20 = await erc20Service.isValidErc20()
          if (isValidErc20) {
            collateralData = await erc20Service.getProfileSummary()
          } else {
            messageErrorData = `The address is not a valid Erc20 token.`
          }
        }
      }
      if (isSubscribed) {
        setCollateral(collateralData)
        setMessageError(messageErrorData)
      }
    }

    fetchIsValidErc20()

    return () => {
      isSubscribed = false
    }
  }, [context, collateralAddress])

  return {
    collateral,
    messageError: messageError,
  }
}
