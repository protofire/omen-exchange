import React from 'react'

import { Token } from '../../../../../util/types'
import { ButtonStateful, ButtonStates } from '../../../../button/button_stateful'

export interface ToggleTokenLockProps {
  collateral?: Token
  onUnlock?: any
  loading: boolean
  finished: boolean
}

export const ToggleTokenLock = (props: ToggleTokenLockProps) => {
  const { collateral, finished, loading, onUnlock, ...restProps } = props

  const state = loading ? ButtonStates.working : finished ? ButtonStates.finished : ButtonStates.idle

  return (
    <ButtonStateful disabled={loading || finished} onClick={onUnlock} state={state} {...restProps}>
      {collateral ? 'Set' : 'Upgrade'}
    </ButtonStateful>
  )
}
