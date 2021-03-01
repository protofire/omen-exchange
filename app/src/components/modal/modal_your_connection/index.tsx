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

const Card = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: ${props => props.theme.borders.borderLineDisabled};
  border-radius: ${props => props.theme.cards.borderRadius};

  &:nth-child(3) {
    margin-top: 16px;
  }
`

const TopCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
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

const BalanceSection = styled.div`
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
`

const CardHeaderText = styled.p`
  font-size: ${props => props.theme.fonts.defaultSize};
  color: ${props => props.theme.colors.textColorLighter};
  margin: 0;
`

const BalanceItems = styled.div`
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  width: 100%;
`

const BalanceItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  &:nth-of-type(2) {
    margin-top: 12px;
  }
`

const BalanceItemLeft = styled.div`
  display: flex;
  align-items: center;
`

const BalanceItemAsset = styled.p`
  font-size: ${props => props.theme.fonts.defaultSize};
  color: ${props => props.theme.colors.textColorDark};
  margin: 0;
  margin-left: 12px;
`

const BalanceItemBalance = styled.p`
  font-size: ${props => props.theme.fonts.defaultSize};
  color: ${props => props.theme.colors.textColorLighter};
  margin: 0;
`

const BottomCardHeader = styled.p``

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
        <Card>
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
          <BalanceSection>
            <CardHeaderText>Wallet</CardHeaderText>
            <BalanceItems>
              <BalanceItem>
                <BalanceItemLeft>
                  <EtherIcon />
                  <BalanceItemAsset>Ether</BalanceItemAsset>
                </BalanceItemLeft>
                <BalanceItemBalance>{formattedEthBalance} ETH</BalanceItemBalance>
              </BalanceItem>
              <BalanceItem>
                <BalanceItemLeft>
                  <DaiIcon size="24px" />
                  <BalanceItemAsset>Dai</BalanceItemAsset>
                </BalanceItemLeft>
                <BalanceItemBalance>{formattedDaiBalance} DAI</BalanceItemBalance>
              </BalanceItem>
            </BalanceItems>
          </BalanceSection>
        </Card>
        <Card>
          <BalanceSection>
            <CardHeaderText>Omen Account</CardHeaderText>
            <BalanceItems>
              <BalanceItem>
                <BalanceItemLeft>
                  <DaiIcon size="24px" />
                  <BalanceItemAsset>Dai</BalanceItemAsset>
                </BalanceItemLeft>
                {/* TODO: Replace hardcoded balance */}
                <BalanceItemBalance>0.00 DAI</BalanceItemBalance>
              </BalanceItem>
            </BalanceItems>
          </BalanceSection>
        </Card>
      </ContentWrapper>
    </Modal>
  )
}

export const ModalYourConnectionWrapper = withTheme(ModalYourConnection)
