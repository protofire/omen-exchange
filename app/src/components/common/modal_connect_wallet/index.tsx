import WalletConnectQRCodeModal from '@walletconnect/qrcode-modal'
import { lighten } from 'polished'
import React, { HTMLAttributes, useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { useWeb3Context } from 'web3-react'

import { ButtonType } from '../../../theme/component_styles/button_styling_types'
import { getLogger } from '../../../util/logger'
import { Wallet } from '../../../util/types'
import { Button } from '../button'
import ModalWrapper from '../modal_wrapper'
import { RadioInput } from '../radio_input'

import MetaMaskSVG from './img/metamask.svg'
import WalletConnectSVG from './img/wallet_connect.svg'

const logger = getLogger('ModalConnectWallet::Index')

const Item = styled.div<{ disabled?: boolean }>`
  border-bottom: 1px solid ${props => props.theme.borders.borderColor};
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  padding: 15px 5px;
  pointer-events: ${props => (props.disabled ? 'none' : 'auto')};
  &[disabled] {
    cursor: not-allowed !important;
    opacity: 0.5;
  }
  &:hover {
    background-color: ${props => lighten(0.6, props.theme.colors.primary)};
  }
`

const Icon = styled.div`
  background-position: 50% 0;
  background-repeat: no-repeat;
  height: 32px;
  margin: 0 20px 0 0;
  width: 32px;
`

const IconWalletConnect = styled(Icon)`
  background-image: url('${WalletConnectSVG}');
`

const IconMetaMask = styled(Icon)`
  background-image: url('${MetaMaskSVG}');
`

const Text = styled.div`
  margin: 0 15px 0 0;
`

const Title = styled.h2`
  color: ${props => props.theme.colors.textColor};
  font-size: 17px;
  font-weight: 700;
  line-height: 1.2;
  margin: 0 0 4px;
  text-align: left;
`

const Description = styled.p`
  color: ${props => props.theme.colors.textColorLight};
  font-size: 13px;
  font-weight: normal;
  line-height: 1.38;
  margin: 0;
  text-align: left;
`

const ButtonStyled = styled(Button)`
  margin-top: 80px;
`

const RadioInputStyled = styled(RadioInput)`
  margin: auto 0;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
}

export const ModalConnectWallet = (props: Props) => {
  const context = useWeb3Context()
  const { isOpen } = props

  if (context.error) {
    logger.error('Error in web3 context', context.error)
    localStorage.removeItem('CONNECTOR')
    props.onClose()
  }

  const doesMetamaskExist = 'ethereum' in window || 'web3' in window

  const [walletSelected, setWalletSelected] = useState(doesMetamaskExist ? Wallet.MetaMask : Wallet.WalletConnect)

  const onClickWallet = (wallet: Wallet) => setWalletSelected(wallet)

  const ItemWalletConnect = () => (
    <Item
      onClick={() => {
        onClickWallet(Wallet.WalletConnect)
      }}
    >
      <IconWalletConnect />
      <Text>
        <Title>WalletConnect</Title>
        <Description>Open protocol for connecting wallets to Dapps.</Description>
      </Text>
      <RadioInputStyled
        checked={walletSelected === Wallet.WalletConnect}
        name="wallet"
        onChange={(e: any) => setWalletSelected(e.target.value as Wallet)}
        value={Wallet.WalletConnect}
      />
    </Item>
  )

  const ItemMetamask = (props: { disabled: boolean }) => (
    <Item
      disabled={props.disabled}
      onClick={() => {
        onClickWallet(Wallet.MetaMask)
      }}
    >
      <IconMetaMask />
      <Text>
        <Title>MetaMask</Title>
        <Description>Use this popular browser extension wallet.</Description>
      </Text>
      <RadioInputStyled
        checked={walletSelected === Wallet.MetaMask}
        disabled={props.disabled}
        name="wallet"
        onChange={(e: any) => setWalletSelected(e.target.value as Wallet)}
        value={Wallet.MetaMask}
      />
    </Item>
  )

  const onClickCloseButton = useCallback(() => {
    props.onClose()
  }, [props])

  useEffect(() => {
    if (context.active && !context.account && context.connectorName === Wallet.WalletConnect) {
      const uri = context.connector.walletConnector.uri
      WalletConnectQRCodeModal.open(uri, () => {
        // Callback passed to the onClose click of the QRCode modal
        onClickCloseButton()
        localStorage.removeItem('CONNECTOR')
        context.unsetConnector()
      })

      context.connector.walletConnector.on('connect', () => {
        WalletConnectQRCodeModal.close()
      })
    }
  }, [context, onClickCloseButton])

  const onConnect = () => {
    context.setConnector(walletSelected)
    localStorage.setItem('CONNECTOR', walletSelected)
  }

  return (
    <>
      {!context.account && (
        <ModalWrapper isOpen={isOpen} onRequestClose={onClickCloseButton} title={`Choose a Wallet`}>
          <ItemMetamask disabled={!doesMetamaskExist} />
          <ItemWalletConnect />
          <ButtonStyled buttonType={ButtonType.primary} onClick={onConnect}>
            Connect
          </ButtonStyled>
        </ModalWrapper>
      )}
    </>
  )
}
