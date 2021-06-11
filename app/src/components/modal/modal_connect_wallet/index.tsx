import React, { HTMLAttributes, useCallback, useEffect, useState } from 'react'
import Modal from 'react-modal'
import styled, { css, withTheme } from 'styled-components'
import { useWeb3Context } from 'web3-react'

import connectors from '../../../util/connectors'
import { getLogger } from '../../../util/logger'
import { Wallet } from '../../../util/types'
import { Button } from '../../button'
import { ButtonType } from '../../button/button_styling_types'
import { Spinner } from '../../common'
import { IconArrowBack, IconArrowRightLong, IconClose, IconOmen } from '../../common/icons'
import { ContentWrapper, ModalNavigation } from '../common_styled'

import MetaMaskSVG from './img/metamask.svg'
import WalletConnectSVG from './img/wallet_connect.svg'

const logger = getLogger('ModalConnectWallet::Index')

const HeaderText = styled.p`
  font-size: 16px;
  font-weight: 500;
  color: ${props => props.theme.colors.textColorDark};
  margin-top: 16px;
  margin-bottom: 48px;
`

const Buttons = styled.div`
  margin-top: auto;
  width: 100%;

  &:last-child {
    margin-top: 0;
  }
`

const ButtonStyled = styled(Button)`
  width: 100%;
  border: none;
  border-bottom: 1px solid ${props => props.theme.buttonPrimaryLine.borderColor};
  border-radius: 0;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &[disabled] {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .arrow-path {
    transition: 0.2s fill;
  }

  &:hover {
    border-bottom: 1px solid ${props => props.theme.buttonPrimaryLine.borderColor};
    background: ${props => props.theme.colors.lightBackground};

    .arrow-path {
      fill: ${props => props.theme.colors.primaryLight};
    }
  }

  &:first-child {
    border-top: 1px solid ${props => props.theme.buttonPrimaryLine.borderColor};

    &:hover {
      border-top: 1px solid ${props => props.theme.buttonPrimaryLine.borderColor};
    }
  }
`

const ButtonLeft = styled.div`
  display: flex;
  align-items: center;
`

const Icon = css`
  background-position: 50% 50%;
  background-repeat: no-repeat;
  background-size: contain;
  display: block;
  height: 22px;
  margin: 0 15px 0 0;
  width: 22px;
`

const IconMetaMask = styled.span`
  ${Icon}
  background-image: url('${MetaMaskSVG}');
`

const IconWalletConnect = styled.span`
  ${Icon}
  background-image: url('${WalletConnectSVG}');
`

const Text = styled.span`
  color: ${props => props.theme.colors.textColorDark};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  margin: 0;
`

const ConnectingText = styled.p`
  color: ${props => props.theme.colors.textColorLighter};
  font-size: 14px;
  font-weight: normal;
  letter-spacing: 0.4px;
  line-height: 1.5;
  margin: 0;
  padding: 30px 0 0;
  text-align: center;
`

interface ButtonProps {
  disabled: boolean
  onClick: () => void
  icon: React.ReactNode
  text: string
}

const ConnectButton = (props: ButtonProps) => {
  const { disabled, icon, onClick, text } = props

  return (
    <ButtonStyled buttonType={ButtonType.secondaryLine} disabled={disabled} onClick={onClick}>
      <ButtonLeft>
        {icon}
        <Text>{text}</Text>
      </ButtonLeft>
      <IconArrowRightLong />
    </ButtonStyled>
  )
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
  theme?: any
}

export const ModalConnectWallet = (props: Props) => {
  const context = useWeb3Context()
  const [connectingToWalletConnect, setConnectingToWalletConnect] = useState(false)
  const [connectingToMetamask, setConnectingToMetamask] = useState(false)
  const [connectingToAuthereum, setConnectingToAuthereum] = useState(false)
  const { isOpen, onClose, theme } = props

  if (context.error) {
    logger.error('Error in web3 context', context.error)
    localStorage.removeItem('CONNECTOR')
    onClose()
  }

  const isMetamaskEnabled = 'ethereum' in window || 'web3' in window
  const onClickWallet = (wallet: Wallet) => {
    if (wallet === Wallet.WalletConnect) {
      setConnectingToWalletConnect(true)
    }
    if (wallet === Wallet.MetaMask) {
      setConnectingToMetamask(true)
    }
    if (wallet === Wallet.Authereum) {
      setConnectingToAuthereum(true)
    }

    if (wallet) {
      context.setConnector(wallet)
      localStorage.setItem('CONNECTOR', wallet)
    }
  }

  const resetEverything = useCallback(() => {
    setConnectingToWalletConnect(false)
    setConnectingToMetamask(false)
    setConnectingToAuthereum(false)
  }, [])

  const onClickCloseButton = useCallback(() => {
    resetEverything() // we need to do this or the states and functions will keep executing even when the modal is closed by the user
    onClose()
  }, [onClose, resetEverything])
  useEffect(() => {
    if (connectingToWalletConnect) {
      connectors.WalletConnect.connect.onConnect(() => onClickCloseButton())
      connectors.WalletConnect.onError = () => onClickCloseButton()
    }
    if (connectingToWalletConnect && context.account && context.connectorName === Wallet.WalletConnect) {
      onClickCloseButton()
      setConnectingToWalletConnect(false)
    }
  }, [context, onClickCloseButton, connectingToWalletConnect])
  useEffect(() => {
    if (connectingToMetamask && context.account && context.connectorName === Wallet.MetaMask) {
      onClickCloseButton()
      setConnectingToMetamask(false)
    }
  }, [context, onClickCloseButton, connectingToMetamask])

  useEffect(() => {
    if (connectingToAuthereum && context.account && context.connectorName === Wallet.Authereum) {
      onClickCloseButton()
      setConnectingToAuthereum(false)
    }
  }, [context, onClickCloseButton, connectingToAuthereum])

  const isConnectingToWallet = connectingToMetamask || connectingToWalletConnect || connectingToAuthereum
  let connectingText = `Connecting to wallet`
  if (connectingToMetamask) {
    connectingText = 'Requesting permission on Metamask'
  }
  if (connectingToWalletConnect) {
    connectingText = 'Opening QR for Wallet Connect'
  }

  const disableMetamask: boolean = !isMetamaskEnabled || false
  const disableWalletConnect = false

  React.useEffect(() => {
    Modal.setAppElement('#root')
  }, [])

  return (
    <>
      <Modal
        isOpen={!context.account && isOpen && !connectingToWalletConnect}
        onRequestClose={onClickCloseButton}
        shouldCloseOnOverlayClick={!isConnectingToWallet}
        style={theme.fixedHeightModal}
      >
        <ContentWrapper>
          <ModalNavigation>
            {isConnectingToWallet ? <IconArrowBack hoverEffect={true} onClick={resetEverything} /> : <div></div>}
            <IconClose hoverEffect={true} onClick={onClickCloseButton} />
          </ModalNavigation>
          <IconOmen dropShadow id="connectWallet" size={56} />
          <HeaderText>{isConnectingToWallet ? 'Unlock Wallet' : 'Connect a Wallet'}</HeaderText>
          {isConnectingToWallet ? (
            <>
              <Spinner big={true} />
              <ConnectingText>{connectingText}</ConnectingText>
            </>
          ) : (
            <>
              <Buttons>
                <ConnectButton
                  disabled={disableMetamask}
                  icon={<IconMetaMask />}
                  onClick={() => {
                    onClickWallet(Wallet.MetaMask)
                  }}
                  text="Metamask"
                />

                <ConnectButton
                  disabled={disableWalletConnect}
                  icon={<IconWalletConnect />}
                  onClick={() => {
                    onClickWallet(Wallet.WalletConnect)
                  }}
                  text="Wallet Connect"
                />
              </Buttons>
            </>
          )}
        </ContentWrapper>
      </Modal>
    </>
  )
}

export const ModalConnectWalletWrapper = withTheme(ModalConnectWallet)
