import React, { HTMLAttributes } from 'react'
import Modal from 'react-modal'
import styled, { withTheme } from 'styled-components'

import { ExchangeType } from '../../../util/types'
import { IconArrowBack, IconClose } from '../../common/icons'
import { ContentWrapper, ModalNavigation, ModalTitle } from '../common_styled'

interface Props extends HTMLAttributes<HTMLDivElement> {
  exchangeType: ExchangeType
  isOpen: boolean
  theme?: any
}

export const DepositWithdrawModal = (props: Props) => {
  const { exchangeType, isOpen, theme } = props

  React.useEffect(() => {
    Modal.setAppElement('#root')
  }, [])

  return (
    <Modal isOpen={isOpen} style={theme.fluidHeightModal}>
      <ContentWrapper>
        <ModalNavigation>
          {/* TODO: Add onClick */}
          <IconArrowBack hoverEffect={true} />
          <ModalTitle>{exchangeType} Dai</ModalTitle>
          {/* TODO: Add onClick */}
          <IconClose hoverEffect={true} />
        </ModalNavigation>
      </ContentWrapper>
    </Modal>
  )
}

export const DepositWithdrawModalWrapper = withTheme(DepositWithdrawModal)
