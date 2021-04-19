import { MaxUint256 } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import { useCallback, useEffect, useState } from 'react'

import { ERC20Service } from '../services'
import { pseudoNativeAssetAddress } from '../util/networks'
import { RemoteData } from '../util/remote_data'

import { useConnectedCPKContext } from './connectedCpk'
import { useConnectedWeb3Context } from './connectedWeb3'

interface CpkAllowance {
  allowance: RemoteData<BigNumber>
  unlock: () => Promise<void>
}

export const useCpkAllowances = (account: string | null, tokenAddresses: string[] | null): CpkAllowance[] => {
  const { library: provider } = useConnectedWeb3Context()
  const cpk = useConnectedCPKContext()
  const [allowances, setAllowances] = useState<CpkAllowance[]>([])

  const updateAllowances = useCallback(async () => {
    if (
      cpk &&
      provider &&
      account &&
      tokenAddresses &&
      tokenAddresses.length > 0 &&
      tokenAddresses.every(tokenAddress => tokenAddress !== pseudoNativeAssetAddress)
    ) {
      const allowances: CpkAllowance[] = []
      for (let i = 0; i < tokenAddresses.length; i++) {
        const collateralService = new ERC20Service(provider, account, tokenAddresses[i])
        let allowance
        try {
          allowance = RemoteData.success(await collateralService.allowance(account, cpk.address))
        } catch (error) {
          allowance = RemoteData.failure(error)
        }
        allowances.push({
          allowance,
          unlock: async () => {
            allowances[i].allowance = RemoteData.load(allowances[i].allowance)
            setAllowances([...allowances])
            try {
              await collateralService.approveUnlimited(cpk.address)
              allowances[i].allowance = RemoteData.success(MaxUint256)
            } catch (error) {
              allowances[i].allowance = RemoteData.failure(error)
            }
            setAllowances([...allowances])
          },
        })
      }
      setAllowances(allowances)
    }
  }, [tokenAddresses, cpk, provider, account])

  useEffect(() => {
    updateAllowances()
  }, [updateAllowances])

  return allowances
}
