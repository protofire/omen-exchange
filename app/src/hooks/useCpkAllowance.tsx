import { Signer } from 'ethers'
import { BigNumber } from 'ethers/utils'
import { useCallback, useEffect, useState } from 'react'

import { ERC20Service } from '../services'

import { useCpk } from './useCpk'

/**
 * Return the allowance of the given `signer` for the cpk.
 *
 * It also returns two helper functions:
 * `updateAllowance` can be used to reload the value of the allowance
 * `unlock` can be used to set unlimited allowance for the cpk
 */
export const useCpkAllowance = (signer: Signer, tokenAddress: string) => {
  const cpk = useCpk()
  const [allowance, setAllowance] = useState<Maybe<BigNumber>>(null)

  const provider = signer.provider

  const updateAllowance = useCallback(async () => {
    if (cpk && provider) {
      const account = await signer.getAddress()
      const collateralService = new ERC20Service(provider, account, tokenAddress)
      const allowance = await collateralService.allowance(account, cpk.address)
      setAllowance(allowance)
    }
  }, [tokenAddress, cpk, provider, signer])

  const unlock = useCallback(async () => {
    if (cpk) {
      const previousAllowance = allowance
      setAllowance(null)
      const account = await signer.getAddress()
      const collateralService = new ERC20Service(provider, account, tokenAddress)
      try {
        await collateralService.approveUnlimited(cpk.address)
      } catch (e) {
        // reset allowance if the user rejects or there's an error
        setAllowance(previousAllowance)
        throw e
      }
      updateAllowance()
    }
  }, [allowance, provider, cpk, signer, tokenAddress, updateAllowance])

  useEffect(() => {
    updateAllowance()
  }, [updateAllowance])

  return {
    allowance,
    updateAllowance,
    unlock,
  }
}
