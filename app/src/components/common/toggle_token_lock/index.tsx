import { BigNumber } from 'ethers/utils'
import React, { useEffect, useState } from 'react'

import { ConnectedWeb3Context } from '../../../hooks/connectedWeb3'
import { CPKService, ERC20Service } from '../../../services'
import { Token } from '../../../util/types'
import { ButtonStateful, ButtonStates } from '../button_stateful'

export interface ToggleTokenLockProps {
  amount: BigNumber
  collateral: Token
  context: ConnectedWeb3Context
}

enum CollateralStatus {
  Lock = 'Lock',
  Undefined = 'Undefined',
  Unlock = 'Unlock',
}

export const ToggleTokenLock = (props: ToggleTokenLockProps) => {
  const { amount, collateral, context } = props
  const { account, library: provider } = context
  const [status, setStatus] = useState(CollateralStatus.Undefined)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!account) {
      return
    }

    const fetchAllowance = async () => {
      const cpk = await CPKService.create(provider)
      const collateralService = new ERC20Service(provider, account, collateral.address)
      const hasEnoughAlowance = await collateralService.hasEnoughAllowance(account, cpk.address, amount)

      const status =
        (amount.isZero() && CollateralStatus.Undefined) ||
        (hasEnoughAlowance && CollateralStatus.Unlock) ||
        (!hasEnoughAlowance && CollateralStatus.Lock) ||
        CollateralStatus.Undefined

      setStatus(status)
    }

    fetchAllowance()
  }, [provider, account, collateral, amount])

  const toggle = async () => {
    const collateralService = new ERC20Service(provider, account, collateral.address)
    const cpk = await CPKService.create(provider)

    setLoading(true)
    if (status === CollateralStatus.Lock) {
      await collateralService.approveUnlimited(cpk.address)
      setStatus(CollateralStatus.Unlock)
    } else {
      await collateralService.approve(cpk.address, new BigNumber(0))
      setStatus(CollateralStatus.Lock)
    }
    setLoading(false)
  }

  return (
    <ButtonStateful
      disabled={amount.isZero() || loading}
      onClick={toggle}
      state={(loading && ButtonStates.working) || ButtonStates.idle}
    >
      {(status === CollateralStatus.Undefined && 'Set') ||
        (status === CollateralStatus.Lock && 'Lock') ||
        (status === CollateralStatus.Unlock && 'Unlock')}
    </ButtonStateful>
  )
}
