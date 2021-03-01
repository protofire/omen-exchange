import { BigNumber } from 'ethers/utils'
import React, { HTMLAttributes } from 'react'
import Modal from 'react-modal'
import styled, { withTheme } from 'styled-components'

import { useConnectedWeb3Context, useTokens } from '../../../hooks'
import { formatBigNumber, formatNumber, truncateStringInTheMiddle } from '../../../util/tools'
import { Button } from '../../button/button'
import { ButtonType } from '../../button/button_styling_types'
import { IconClose, IconMetaMask, IconWalletConnect } from '../../common/icons'
import { IconJazz } from '../../common/icons/IconJazz'
import { DaiIcon, EtherIcon } from '../../common/icons/currencies'
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
  flex-direction: column;
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

const TopCardWallet = styled.div`
  padding: 16px 20px 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
`

const TopCardWalletHeader = styled.p`
  font-size: ${props => props.theme.fonts.defaultSize};
  color: ${props => props.theme.colors.textColorLighter};
  margin: 0;
`

const WalletItems = styled.div`
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  width: 100%;
`

const WalletItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  &:first-of-type {
    margin-bottom: 12px;
  }
`

const WalletItemLeft = styled.div`
  display: flex;
  align-items: center;
`

const WalletItemAsset = styled.p`
  font-size: ${props => props.theme.fonts.defaultSize};
  color: ${props => props.theme.colors.textColorDark};
  margin: 0;
  margin-left: 12px;
`

const WalletItemBalance = styled.p`
  font-size: ${props => props.theme.fonts.defaultSize};
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

  const { tokens } = useTokens(context, true, true)

  const ethBalance = new BigNumber(tokens.filter(token => token.symbol === 'ETH')[0].balance || '')
  const formattedEthBalance = formatNumber(formatBigNumber(ethBalance, 18, 18))
  const daiBalance = new BigNumber(tokens.filter(token => token.symbol === 'DAI')[0].balance || '')
  const formattedDaiBalance = formatNumber(formatBigNumber(daiBalance, 18, 18))

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
                <IconJazz account={account || ''} size={28} />
              </ConnectionIconWrapper>
              <AccountInfo>
                <AccountInfoAddress>{truncateStringInTheMiddle(account || '', 5, 3)}</AccountInfoAddress>
                <AccountInfoWallet>{context.rawWeb3Context.connectorName}</AccountInfoWallet>
              </AccountInfo>
            </TopCardHeaderLeft>
            {/* TODO: Add onClick */}
            <ChangeWalletButton buttonType={ButtonType.secondaryLine}>Change</ChangeWalletButton>
          </TopCardHeader>
          <TopCardWallet>
            <TopCardWalletHeader>Wallet</TopCardWalletHeader>
            <WalletItems>
              <WalletItem>
                <WalletItemLeft>
                  <EtherIcon />
                  <WalletItemAsset>Ether</WalletItemAsset>
                </WalletItemLeft>
                <WalletItemBalance>{formattedEthBalance} ETH</WalletItemBalance>
              </WalletItem>
              <WalletItem>
                <WalletItemLeft>
                  <DaiIcon size="24px" />
                  <WalletItemAsset>Dai</WalletItemAsset>
                </WalletItemLeft>
                <WalletItemBalance>{formattedDaiBalance} DAI</WalletItemBalance>
              </WalletItem>
            </WalletItems>
          </TopCardWallet>
        </TopCard>
      </ContentWrapper>
    </Modal>
  )
}

export const ModalYourConnectionWrapper = withTheme(ModalYourConnection)
