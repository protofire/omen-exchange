import { useEffect, useState } from 'react'

import { ConnectedWeb3Context } from './connectedWeb3'
import { getToken } from '../util/addresses'
import { ERC20Service } from '../services'
import { Token } from '../util/types'
import { getLogger } from '../util/logger'

const logger = getLogger('Hooks::useCollateral')

export const useCollateral = (
  collateralId: KnownToken | string,
  context: ConnectedWeb3Context,
): Maybe<Token> => {
  const [collateral, setCollateral] = useState<Maybe<Token>>(null)

  useEffect(() => {
    let isSubscribed = true

    const fetchIsValidErc20 = async () => {
      let collateralData: Maybe<Token> = null
      const erc20Service = new ERC20Service(context.library, collateralId)
      const isValidErc20 = await erc20Service.isValidErc20()

      if (isValidErc20) {
        const data = await erc20Service.getProfileSummary()
        collateralData = {
          ...data,
        } as Token
      } else {
        try {
          collateralData = getToken(context.networkId, collateralId as KnownToken)
        } catch (err) {
          logger.error(err.message)
        }
      }

      if (isSubscribed) setCollateral(collateralData)
    }

    fetchIsValidErc20()

    return () => {
      isSubscribed = false
    }
  }, [context, collateralId])

  return collateral
}
