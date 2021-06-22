import React, { HTMLAttributes } from 'react'
import Modal from 'react-modal'
import styled, { withTheme } from 'styled-components'

import { Button } from '../../button'
import { ButtonType } from '../../button/button_styling_types'
import { IconClose } from '../../common/icons'
import { DaiIcon } from '../../common/icons/currencies'
import { ContentWrapper, ModalNavigation, ModalNavigationLeft } from '../common_styled'

const ModalMainText = styled.p`
  font-size: 16px;
  color: ${props => props.theme.colors.textColorDark};
  margin: 0;
  font-weight: 500;
  margin-top: 28px
  margin-bottom: 8px;
  display: flex;
  align-items: center;
`

const ModalSubText = styled.p`
  font-size: ${props => props.theme.fonts.defaultFontSize};
  color: ${props => props.theme.colors.textColorLighter};
  margin: 0;
`

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 20px;
`

const ModalButton = styled(Button)`
  width: 100%;
`

const ModalButtonWrapper = styled.a`
  width: 100%;
  margin-top: 12px;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  icon?: string
  isOpen: boolean
  message: string
  currencies?: string
  theme: any
  onClose: () => void
  onClick: () => void
}

export const ModalClaim = (props: Props) => {
  const { currencies, isOpen, message, onClick, onClose, theme } = props

  React.useEffect(() => {
    Modal.setAppElement('#root')
  }, [])

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} shouldCloseOnOverlayClick={true} style={theme.fluidHeightModal}>
      <ContentWrapper>
        <ModalNavigation>
          <ModalNavigationLeft></ModalNavigationLeft>
          <IconClose hoverEffect={true} onClick={onClose} />
        </ModalNavigation>
        <DaiIcon size="64" />
        <ModalMainText>{message}</ModalMainText>
        <ModalSubText>You need to claim your withdrawal</ModalSubText>
        <ButtonContainer>
          <ModalButtonWrapper>
            <ModalButton buttonType={ButtonType.primary} onClick={onClick}>
              Claim {currencies}
            </ModalButton>
          </ModalButtonWrapper>
        </ButtonContainer>
      </ContentWrapper>
    </Modal>
  )
}

export const ModalClaimWrapper = withTheme(ModalClaim)
