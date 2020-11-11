import WalletConnectQRCodeModal from '@walletconnect/qrcode-modal'
import React, { HTMLAttributes, useCallback, useEffect, useState } from 'react'
import styled, { css } from 'styled-components'
import { useWeb3Context } from 'web3-react'

import { getLogger } from '../../../util/logger'
import { Wallet } from '../../../util/types'
import { Button } from '../../button'
import { ButtonType } from '../../button/button_styling_types'
import { MadeBy, Spinner } from '../../common'
import { ModalWrapper } from '../../modal/modal_wrapper'

import AuthereumSVG from './img/authereum.svg'
import MetaMaskSVG from './img/metamask.svg'
import WalletConnectSVG from './img/wallet_connect.svg'

const logger = getLogger('ModalConnectWallet::Index')

const ContentWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 230px;
  padding: 15px 0 0;
`

const Buttons = styled.div`
  margin-top: auto;

  &:last-child {
    margin-top: 0;
  }
`

const ButtonStyled = styled(Button)`
  margin-bottom: 14px;
  width: 200px;

  &[disabled] {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:last-child {
    margin-bottom: 0;
  }
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

const IconAuthereum = styled.span`
  ${Icon}
  background-image: url('${AuthereumSVG}');
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
      {icon}
      <Text>{text}</Text>
    </ButtonStyled>
  )
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
}

export const ModalConnectWallet = (props: Props) => {
  const context = useWeb3Context()
  const [connectingToWalletConnect, setConnectingToWalletConnect] = useState(false)
  const [connectingToMetamask, setConnectingToMetamask] = useState(false)
  const [connectingToAuthereum, setConnectingToAuthereum] = useState(false)
  const { isOpen, onClose } = props

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
    WalletConnectQRCodeModal.close()
  }, [])

  const onClickCloseButton = useCallback(() => {
    resetEverything() // we need to do this or the states and functions will keep executing even when the modal is closed by the user
    onClose()
  }, [onClose, resetEverything])

  useEffect(() => {
    if (
      connectingToWalletConnect &&
      context.active &&
      !context.account &&
      context.connectorName === Wallet.WalletConnect
    ) {
      const uri = context.connector.walletConnector.uri
      WalletConnectQRCodeModal.open(uri, () => {
        // Callback passed to the onClose click of the QRCode modal
        setConnectingToWalletConnect(false)
        onClickCloseButton()
        localStorage.removeItem('CONNECTOR')
        context.unsetConnector()
      })

      context.connector.walletConnector.on('connect', () => {
        setConnectingToWalletConnect(false)
        WalletConnectQRCodeModal.close()
      })
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
    connectingText = 'Waiting for Approval on Metamask'
  }
  if (connectingToWalletConnect) {
    connectingText = 'Opening QR for Wallet Connect'
  }

  const disableMetamask: boolean = !isMetamaskEnabled || false
  const disableWalletConnect = false
  const disableAuthereum = false

  return (
    <>
      <ModalWrapper
        isOpen={!context.account && isOpen}
        onRequestClose={onClickCloseButton}
        shouldCloseOnOverlayClick={!isConnectingToWallet}
        title={connectingToMetamask ? 'Connecting...' : 'Connect a Wallet'}
      >
        <ContentWrapper>
          {isConnectingToWallet ? (
            <>
              <Spinner />
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

                <ConnectButton
                  disabled={disableAuthereum}
                  icon={<IconAuthereum />}
                  onClick={() => {
                    onClickWallet(Wallet.Authereum)
                  }}
                  text="Authereum"
                />
              </Buttons>
            </>
          )}
        </ContentWrapper>
        <MadeBy />
      </ModalWrapper>
    </>
  )
}
