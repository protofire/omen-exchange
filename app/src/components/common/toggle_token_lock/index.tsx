import React from 'react'

import { ButtonStateful, ButtonStates } from '../button_stateful'

export interface ToggleTokenLockProps {
  onUnlock?: any
  loading: boolean
  finished: boolean
}

export const ToggleTokenLock = (props: ToggleTokenLockProps) => {
  const { finished, loading, onUnlock } = props

  const state = loading ? ButtonStates.working : finished ? ButtonStates.finished : ButtonStates.idle

  return (
    <ButtonStateful disabled={loading || finished} onClick={onUnlock} state={state}>
      Set
    </ButtonStateful>
  )
}
