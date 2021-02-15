import { BigNumber } from 'ethers/utils'
import { useEffect, useState } from 'react'

import { CompoundService } from '../services'
import { pseudoNativeAssetAddress } from '../util/networks'
import { Token } from '../util/types'

import { ConnectedWeb3Context } from './connectedWeb3'

export const useCompoundService = (
  collateral: Token,
  context: ConnectedWeb3Context,
): {
  compoundService: Maybe<BigNumber>
  fetchCompoundService: () => Promise<void>
} => {
  const { account, library: provider } = context

  const [compoundService, setCompoundService] = useState<Maybe<BigNumber>>(null)

  const fetchCompoundService = async (compoundServiceObject) => {
    if (collateral.symbol.toLowerCase() in CompoundTokenType) {
      await compoundServiceObject.init()
      setCompoundService(compoundServiceObject)
    }
  }

  useMemo(() => {
    const compoundService = new CompoundService(collateral.address, collateral.symbol, provider, account)  
    fetchCompoundService(compoundService)
  }, [collateral.address, account, collateral.symbol, provider])

  useEffect(() => {
    const compoundService = new CompoundService(collateral.address, collateral.symbol, provider, account)  
    fetchCompoundService(compoundService)
  }, [])

  return { compoundService, fetchCompoundService }
}
