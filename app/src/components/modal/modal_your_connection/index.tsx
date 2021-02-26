import React, { HTMLAttributes } from 'react'
import Modal from 'react-modal'
import styled, { withTheme } from 'styled-components'

import { Button } from '../../button/button'
import { ButtonType } from '../../button/button_styling_types'
import { IconClose } from '../../common/icons'
import { ConnectionIcon } from '../../common/network/img/ConnectionIcon'
import { ContentWrapper, ModalNavigation } from '../common_styled'

const ModalTitle = styled.p`
  font-size: 16px;
  color: ${props => props.theme.colors.textColorDark};
  font-weight: 500;
  margin: 0;
`

const TopCard = styled.div`
  padding: 16px 0;
  width: 100%;
  display: flex;
  align-items: center;
  border: ${props => props.theme.borders.borderLineDisabled};
  border-radius: ${props => props.theme.cards.borderRadius};
`

const TopCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px 16px;
  width: 100%;
  border-bottom: ${props => props.theme.borders.borderLineDisabled};
`

const TopCardHeaderLeft = styled.div`
  display: flex;
  align-items: center;
`

const ConnectionIconWrapper = styled.div`
  height: 28px;
  width: 28px;
`

const AccountInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-contect: space-between;
  margin-left: 12px;
`

const AccountInfoAddress = styled.p`
  font-size: ${props => props.theme.fonts.defaultSize};
  color: ${props => props.theme.colors.textColorDark};
  margin: 0;
`

const AccountInfoWallet = styled.p`
  font-size: 12px;
  color: ${props => props.theme.colors.textColorLighter};
  margin: 0;
`

const ChangeWalletButton = styled(Button)``

interface Props extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
  theme?: any
}

export const ModalYourConnection = (props: Props) => {
  const { isOpen, onClose, theme } = props

  React.useEffect(() => {
    Modal.setAppElement('#root')
  }, [])

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} shouldCloseOnOverlayClick={true} style={theme.connectionModal}>
      <ContentWrapper>
        <ModalNavigation>
          <ModalTitle>Your Connection</ModalTitle>
          <IconClose hoverEffect={true} onClick={onClose} />
        </ModalNavigation>
        <TopCard>
          <TopCardHeader>
            <TopCardHeaderLeft>
              <ConnectionIconWrapper>
                <ConnectionIcon scale="1.4" />
              </ConnectionIconWrapper>
              <AccountInfo>
                {/* TODO: Replace hardcoded address */}
                <AccountInfoAddress>0xEa6...D7b</AccountInfoAddress>
                {/* TODO: Replace hardcoded wallet */}
                <AccountInfoWallet>Metamask</AccountInfoWallet>
              </AccountInfo>
            </TopCardHeaderLeft>
            <ChangeWalletButton buttonType={ButtonType.secondaryLine}>Change</ChangeWalletButton>
          </TopCardHeader>
        </TopCard>
      </ContentWrapper>
    </Modal>
  )
}

export const ModalYourConnectionWrapper = withTheme(ModalYourConnection)
