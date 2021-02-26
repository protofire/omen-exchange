import React, { HTMLAttributes } from 'react'
import Modal from 'react-modal'
import styled, { withTheme } from 'styled-components'

import { useConnectedWeb3Context } from '../../../hooks'
import { truncateStringInTheMiddle } from '../../../util/tools'
import { Button } from '../../button/button'
import { ButtonType } from '../../button/button_styling_types'
import { IconClose, IconMetaMask, IconWalletConnect } from '../../common/icons'
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
  position: relative;
`

const ConnectorCircle = styled.div`
  height: 20px;
  width: 20px;
  border-radius: 50%;
  border: ${props => props.theme.borders.borderLineDisabled};
  background: #fff;
  z-index: 2;
  position: absolute;
  bottom: 0;
  right: -4px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  const context = useConnectedWeb3Context()
  const { account } = context

  React.useEffect(() => {
    Modal.setAppElement('#root')
  }, [])

  const connectorIcon =
    context.rawWeb3Context.connectorName === 'MetaMask' ? (
      <IconMetaMask />
    ) : context.rawWeb3Context.connectorName === 'WalletConnect' ? (
      <IconWalletConnect />
    ) : (
      <></>
    )

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
                <ConnectorCircle>{connectorIcon}</ConnectorCircle>
                <ConnectionIcon scale="1.4" />
              </ConnectionIconWrapper>
              <AccountInfo>
                <AccountInfoAddress>{truncateStringInTheMiddle(account || '', 5, 3)}</AccountInfoAddress>
                <AccountInfoWallet>{context.rawWeb3Context.connectorName}</AccountInfoWallet>
              </AccountInfo>
            </TopCardHeaderLeft>
            {/* TODO: Add onClick */}
            <ChangeWalletButton buttonType={ButtonType.secondaryLine}>Change</ChangeWalletButton>
          </TopCardHeader>
        </TopCard>
      </ContentWrapper>
    </Modal>
  )
}

export const ModalYourConnectionWrapper = withTheme(ModalYourConnection)
