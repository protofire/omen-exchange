import React, { HTMLAttributes, useCallback, useEffect, useState } from 'react'
import Modal from 'react-modal'
import styled, { css, withTheme } from 'styled-components'
import { useWeb3Context } from 'web3-react'

import { TYPE } from '../../../theme'
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
  border-bottom: 1px solid ${props => props.theme.border1};
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
    border-bottom: 1px solid ${props => props.theme.border1};
    background: ${props => props.theme.colors.lightBackground};

    .arrow-path {
      fill: ${props => props.theme.primary1};
    }
  }

  &:first-child {
    border-top: 1px solid ${props => props.theme.border1};

    &:hover {
      border-top: 1px solid ${props => props.theme.border1};
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
        <TYPE.bodyRegular color={'text1'} margin={'0px'}>
          {text}
        </TYPE.bodyRegular>
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

    if (wallet) {
      context.setConnector(wallet)
      localStorage.setItem('CONNECTOR', wallet)
    }
  }

  const resetEverything = useCallback(() => {
    setConnectingToWalletConnect(false)
    setConnectingToMetamask(false)
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

  const isConnectingToWallet = connectingToMetamask || connectingToWalletConnect
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
        style={{ ...theme.fixedHeightModal, content: { ...theme.fluidHeightModal.content, minHeight: '510px' } }}
      >
        <ContentWrapper>
          <ModalNavigation>
            {isConnectingToWallet ? <IconArrowBack hoverEffect={true} onClick={resetEverything} /> : <div></div>}
            <IconClose hoverEffect={true} onClick={onClickCloseButton} />
          </ModalNavigation>
          <IconOmen dropShadow id="connectWallet" size={56} />
          <TYPE.heading3 color={'text1'} margin={'16px 0px 48px'}>
            {isConnectingToWallet ? 'Unlock Wallet' : 'Connect a Wallet'}
          </TYPE.heading3>
          {isConnectingToWallet ? (
            <>
              <Spinner big={true} />
              <TYPE.bodyRegular color={'text2'} padding={'30px 0 0'} textAlign={'center'}>
                {connectingText}
              </TYPE.bodyRegular>
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
