import React, { useState, HTMLAttributes, useEffect, useCallback } from 'react'
import { useWeb3Context } from 'web3-react'
import styled, { css } from 'styled-components'
import WalletConnectQRCodeModal from '@walletconnect/qrcode-modal'

import { Button } from '../button'
import { RadioInput } from '../radio_input'
import { Wallet } from '../../../util/types'
import CloseSVG from './img/close.svg'
import WalletConnectSVG from './img/wallet_connect.svg'
import MetaMaskSVG from './img/metamask.svg'
import { getLogger } from '../../../util/logger'

const logger = getLogger('ModalConnectWallet::Index')

const Wrapper = styled.div`
  align-items: center;
  background-color: rgb(255, 255, 255, 0.75);
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: center;
  left: 0;
  position: fixed;
  top: 0;
  width: 100vw;
  z-index: 12345;
`

const Card = styled.div`
  width: 353.7px;
  height: 367px;
  border-radius: 5px;
  box-shadow: 0 0 18px 0 rgba(0, 0, 0, 0.08);
  background-color: #ffffff;
`

const CloseIcon = styled.div`
  background-image: url(${CloseSVG});
  width: 12px;
  height: 10px;
  object-fit: contain;
  margin-top: 15px;
  margin-right: 15px;
  float: right;
  cursor: pointer;
`

const ModalTitle = styled.div`
  font-family: 'Open Sans';
  font-size: 18px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.33;
  letter-spacing: normal;
  text-align: left;
  color: #222222;
  margin-top: 15px;
  margin-left: 15px;
`

const ItemTitleCSS = css`
  object-fit: contain;
  font-family: Roboto;
  font-size: 17px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.35;
  letter-spacing: normal;
  text-align: left;
  color: #000000;
  display: inline-block;
`

const ItemTitleWalletConnect = styled.div`
  ${ItemTitleCSS}
  margin-left: 12px;
  vertical-align: 10px;
`

const ItemTitleMetaMask = styled.div`
  ${ItemTitleCSS}
  margin-left: 18px;
  vertical-align: 14px;
`

const ItemDescription = styled.div`
  display: inline-block;
  width: 230px;
  height: 34px;
  font-family: Roboto;
  font-size: 13px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.23;
  letter-spacing: normal;
  text-align: left;
  color: #555555;
  position: relative;
  margin-left: 68px;
  top: -10px;
`

const ItemIconWalletCSS = css`
  object-fit: contain;
  margin-left: 24px;
  margin-top: 20px;
  display: inline-block;
`

const ItemIconWalletConnect = styled.div`
  ${ItemIconWalletCSS}
  background-image: url(${WalletConnectSVG});
  width: 32px;
  height: 19.6px;
`

const ItemIconMetaMask = styled.div`
  ${ItemIconWalletCSS}
  background-image: url(${MetaMaskSVG});
  width: 26.4px;
  height: 24.4px;
`

interface ItemSeparatorProps {
  marginTop?: number
}

const ItemSeparator = styled.div`
  width: 322px;
  height: 0.5px;
  border: solid 1px #d5d5d5;
  margin-top: 20px;
  margin-top: ${(props: ItemSeparatorProps) => props.marginTop || 20}px;
  margin-left: 15px;
  margin-right: 10px;
`

const ButtonContainerStyled = styled.div`
  > button {
    width: 322px;
    height: 38px;
    border-radius: 3px;
    margin-left: 15px;
    margin-top: 75px;
  }
`

const RadioInputStyled = styled(RadioInput)`
  display: inline-block;
  top: -20px;
  left: 20px;
`

const ItemWalletWrapper = styled.div`
  cursor: pointer;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  theme?: any
  onClose: () => void
}

export const ModalConnectWallet = (props: Props) => {
  const context = useWeb3Context()

  if (context.error) {
    logger.error('Error in web3 context', context.error)
  }

  const [walletSelected, setWalletSelected] = useState(Wallet.MetaMask)

  const onClickWallet = (wallet: Wallet) => setWalletSelected(wallet)

  const ItemWalletConnect = () => (
    <ItemWalletWrapper onClick={() => { onClickWallet(Wallet.WalletConnect)}}>
      <ItemIconWalletConnect />
      <ItemTitleWalletConnect>WalletConnect</ItemTitleWalletConnect>
      <ItemDescription>Open protocol for connecting wallets to Dapps.</ItemDescription>
      <RadioInputStyled
        name="wallet"
        checked={walletSelected === Wallet.WalletConnect}
        value={Wallet.WalletConnect}
        onChange={(e: any) => setWalletSelected(e.target.value as Wallet)}
      />
    </ItemWalletWrapper>
  )

  const ItemMetamaskConnect = () => (
    <ItemWalletWrapper onClick={() => { onClickWallet(Wallet.MetaMask)}}>
      <ItemIconMetaMask />
      <ItemTitleMetaMask>MetaMask</ItemTitleMetaMask>
      <ItemDescription>Use this popular browser extension wallet.</ItemDescription>
      <RadioInputStyled
        name="wallet"
        checked={walletSelected === Wallet.MetaMask}
        value={Wallet.MetaMask}
        onChange={(e: any) => setWalletSelected(e.target.value as Wallet)}
      />
    </ItemWalletWrapper>
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
        <Wrapper>
          <Card>
            <CloseIcon onClick={onClickCloseButton} />
            <ModalTitle>Choose a Wallet</ModalTitle>
            <ItemSeparator />
            <ItemWalletConnect />
            <ItemSeparator marginTop={5} />
            <ItemMetamaskConnect />
            <ItemSeparator marginTop={5} />
            <ButtonContainerStyled onClick={onConnect}>
              <Button>CONNECT</Button>
            </ButtonContainerStyled>
          </Card>
        </Wrapper>
      )}
    </>
  )
}
