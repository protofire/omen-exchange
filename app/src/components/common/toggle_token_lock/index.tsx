import { BigNumber } from 'ethers/utils'
import React, { useEffect, useState } from 'react'

import { ConnectedWeb3Context } from '../../../hooks/connectedWeb3'
import { Token } from '../../../util/types'
import { ButtonStateful, ButtonStates } from '../button_stateful'

export interface ToggleTokenLockProps {
  amount: BigNumber
  collateral: Token
  context: ConnectedWeb3Context
  onUnlock?: any
}

export const ToggleTokenLock = (props: ToggleTokenLockProps) => {
  const { amount, context, onUnlock } = props
  const { account } = context
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!account) {
      return
    }

    setLoading(false)
  }, [account, setLoading])

  return (
    <ButtonStateful
      disabled={amount.isZero() || loading}
      onClick={onUnlock}
      state={(loading && ButtonStates.working) || ButtonStates.idle}
    >
      Set
    </ButtonStateful>
  )
}
