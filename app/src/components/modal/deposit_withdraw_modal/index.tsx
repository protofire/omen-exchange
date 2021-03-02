import React, { HTMLAttributes } from 'react'
import Modal from 'react-modal'
import styled, { withTheme } from 'styled-components'

import { ExchangeType } from '../../../util/types'
import { IconArrowBack, IconClose } from '../../common/icons'
import { ContentWrapper, ModalNavigation, ModalTitle } from '../common_styled'

interface Props extends HTMLAttributes<HTMLDivElement> {
  exchangeType: ExchangeType
  isOpen: boolean
  onBack: () => void
  onClose: () => void
  theme?: any
}

export const DepositWithdrawModal = (props: Props) => {
  const { exchangeType, isOpen, onBack, onClose, theme } = props

  React.useEffect(() => {
    Modal.setAppElement('#root')
  }, [])

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={theme.fluidHeightModal}>
      <ContentWrapper>
        <ModalNavigation>
          {/* TODO: Add onClick */}
          <IconArrowBack hoverEffect={true} onClick={onBack} />
          <ModalTitle>{exchangeType} Dai</ModalTitle>
          {/* TODO: Add onClick */}
          <IconClose hoverEffect={true} onClick={onClose} />
        </ModalNavigation>
      </ContentWrapper>
    </Modal>
  )
}

export const DepositWithdrawModalWrapper = withTheme(DepositWithdrawModal)
