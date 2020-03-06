import React from 'react'

import { ButtonType } from '../../../theme/component_styles/button_styling_types'
import { Button } from '../button'

interface Props {
  modalState: boolean
  onClick: () => void
}

export const ButtonConnectWallet = (props: Props) => {
  const { modalState, onClick, ...restProps } = props
  const buttonMessage = modalState ? 'Connecting...' : 'Connect'

  return (
    <Button buttonType={ButtonType.primary} disabled={modalState} onClick={onClick} {...restProps}>
      {buttonMessage}
    </Button>
  )
}
