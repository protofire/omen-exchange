import WalletConnectQRCodeModal from '@walletconnect/qrcode-modal'
import React, { HTMLAttributes, useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { useWeb3Context } from 'web3-react'

import { IS_CORONA_VERSION, LINK_TERMS_AND_CONDITIONS } from '../../../common/constants'
import { getLogger } from '../../../util/logger'
import { Wallet } from '../../../util/types'
import { Button } from '../../button'
import { ButtonType } from '../../button/button_styling_types'
import { CheckboxInput, MadeBy, Spinner } from '../../common'
import { ModalWrapper } from '../../modal/modal_wrapper'

import MetaMaskSVG from './img/metamask.svg'
import WalletConnectSVG from './img/wallet_connect.svg'

const logger = getLogger('ModalConnectWallet::Index')

const ButtonsWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 218px;
  padding: 15px 0;
`

const ButtonStyled = styled(Button)`
  height: 38px;
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

const Icon = styled.span`
  background-position: 50% 50%;
  background-repeat: no-repeat;
  display: block;
  height: 22px;
  margin: 0 15px 0 0;
  width: 22px;
`

const IconWalletConnect = styled(Icon)`
  background-image: url('${WalletConnectSVG}');
`

const IconMetaMask = styled(Icon)`
  background-image: url('${MetaMaskSVG}');
`

const Text = styled.span`
  color: ${props => props.theme.colors.textColorDark};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  margin: 0;
`

const TermsWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`

const TermsText = styled.label`
  color: ${props => props.theme.colors.textColor};
  font-size: 15px;
  font-weight: normal;
  letter-spacing: 0.2px;
  line-height: 1.2;
  padding-left: 8px;
`

const TermsLink = styled.a`
  color: ${props => props.theme.colors.textColor};
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
}

export const ModalConnectWallet = (props: Props) => {
  const context = useWeb3Context()
  const [showWalletConnectQR, setShowWalletConnectQR] = useState(false)
  const [showConnectingMessage, setShowConnectingMessage] = useState(false)
  const { isOpen, onClose } = props

  if (context.error) {
    logger.error('Error in web3 context', context.error)
    localStorage.removeItem('CONNECTOR')
    onClose()
  }

  const doesMetamaskExist = 'ethereum' in window || 'web3' in window
  const onClickWallet = (wallet: Wallet) => {
    if (wallet === Wallet.WalletConnect) {
      setShowWalletConnectQR(true)
    }
    if (wallet === Wallet.MetaMask) {
      setShowConnectingMessage(true)
    }
    context.setConnector(wallet)
    localStorage.setItem('CONNECTOR', wallet)
  }

  const onClickCloseButton = useCallback(() => {
    onClose()
  }, [onClose])

  const [acceptedTerms, setAcceptedTerms] = useState(LINK_TERMS_AND_CONDITIONS ? false : true)

  useEffect(() => {
    if (showWalletConnectQR && context.active && !context.account && context.connectorName === Wallet.WalletConnect) {
      const uri = context.connector.walletConnector.uri
      WalletConnectQRCodeModal.open(uri, () => {
        // Callback passed to the onClose click of the QRCode modal
        setShowWalletConnectQR(false)
        onClickCloseButton()
        localStorage.removeItem('CONNECTOR')
        context.unsetConnector()
      })

      context.connector.walletConnector.on('connect', () => {
        setShowWalletConnectQR(false)
        WalletConnectQRCodeModal.close()
      })
    }
  }, [context, onClickCloseButton, showWalletConnectQR])

  useEffect(() => {
    if (showConnectingMessage && context.account && context.connectorName === Wallet.MetaMask) {
      onClickCloseButton()
      setShowConnectingMessage(false)
    }
  }, [context, onClickCloseButton, showConnectingMessage])

  const MetamaskButton = (props: { disabled: boolean }) => (
    <ButtonStyled
      buttonType={ButtonType.secondaryLine}
      disabled={props.disabled}
      onClick={() => {
        onClickWallet(Wallet.MetaMask)
      }}
    >
      <IconMetaMask />
      <Text>MetaMask</Text>
    </ButtonStyled>
  )

  const WalletConnectButton = (props: { disabled: boolean }) => (
    <ButtonStyled
      buttonType={ButtonType.secondaryLine}
      disabled={props.disabled}
      onClick={() => {
        onClickWallet(Wallet.WalletConnect)
      }}
    >
      <IconWalletConnect />
      <Text>Wallet Connect</Text>
    </ButtonStyled>
  )

  return (
    <>
      {!context.account && (
        <ModalWrapper isOpen={isOpen} onRequestClose={onClickCloseButton} title={`Connect a Wallet`}>
          {showConnectingMessage ? (
            <>
              <Spinner height="25px" width="25px"></Spinner>
              <Text>Waiting for metamask connection</Text>
            </>
          ) : (
            <ButtonsWrapper>
              <MetamaskButton disabled={!doesMetamaskExist || !acceptedTerms} />
              <WalletConnectButton disabled={!acceptedTerms} />
            </ButtonsWrapper>
          )}
          {LINK_TERMS_AND_CONDITIONS && (
            <TermsWrapper>
              <CheckboxInput
                checked={acceptedTerms}
                inputId="termsCheck"
                onChange={() => setAcceptedTerms(!acceptedTerms)}
              />
              <TermsText className="clickable" htmlFor="termsCheck">
                I agree to the{' '}
                <TermsLink href={LINK_TERMS_AND_CONDITIONS} target="_blank">
                  Terms and Conditions
                </TermsLink>
              </TermsText>
            </TermsWrapper>
          )}
          {!IS_CORONA_VERSION && <MadeBy />}
        </ModalWrapper>
      )}
    </>
  )
}
