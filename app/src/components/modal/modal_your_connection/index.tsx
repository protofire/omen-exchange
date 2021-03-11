import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React, { HTMLAttributes, useEffect, useState } from 'react'
import Modal from 'react-modal'
import styled, { withTheme } from 'styled-components'

import { useCollateralBalance, useConnectedWeb3Context, useTokens } from '../../../hooks'
import { useXdaiBridge } from '../../../hooks/useXdaiBridge'
import { XdaiService } from '../../../services'
import { getNativeAsset, getToken, networkIds } from '../../../util/networks'
import { formatBigNumber, formatNumber, truncateStringInTheMiddle, waitForConfirmations } from '../../../util/tools'
import { TransactionStep, TransactionType, WalletState } from '../../../util/types'
import { Button } from '../../button/button'
import { ButtonType } from '../../button/button_styling_types'
import { IconClose, IconMetaMask, IconWalletConnect } from '../../common/icons'
import { IconJazz } from '../../common/icons/IconJazz'
import { DaiIcon, EtherIcon } from '../../common/icons/currencies'
import {
  BalanceItem,
  BalanceItemBalance,
  BalanceItemSide,
  BalanceItemTitle,
  BalanceItems,
  BalanceSection,
  ContentWrapper,
  ModalCard,
  ModalNavigation,
  ModalTitle,
} from '../common_styled'
import { ModalTransactionWrapper } from '../modal_transaction'

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

const CardHeaderText = styled.p`
  font-size: ${props => props.theme.fonts.defaultSize};
  color: ${props => props.theme.colors.textColorLighter};
  margin: 0;
`

const BalanceItemInfo = styled.p`
  font-size: ${props => props.theme.fonts.defaultSize};
  color: ${props => props.theme.colors.textColorLighter};
  margin: 0;
  margin-left: 4px;
`

const BalanceDivider = styled.div`
  width: 100%;
  height: 1px;
  background: ${props => props.theme.borders.borderDisabled};
  margin: 16px 0;
`

const ClaimButton = styled(Button)`
  width: 100%;
  margin-top: 16px;
`

const ChangeWalletButton = styled(Button)``

const DepositWithdrawButtons = styled.div`
  padding: 16px 20px;
  border-top: ${props => props.theme.borders.borderLineDisabled};
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const DepositWithdrawButton = styled(Button)`
  width: calc(50% - 8px);
`

const EnableDai = styled.div`
  width: 100%;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const EnableDaiText = styled.p`
  font-size: ${props => props.theme.fonts.defaultSize};
  color: ${props => props.theme.colors.textColorLighter};
  text-align: center;
  margin: 16px 0;
`

const EnableDaiButton = styled(Button)`
  width: 100%;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  changeWallet: () => void
  isOpen: boolean
  onClose: () => void
  openDepositModal: () => void
  openWithdrawModal: () => void
  theme?: any
}

export const ModalYourConnection = (props: Props) => {
  const { changeWallet, isOpen, onClose, openDepositModal, openWithdrawModal, theme } = props

  const context = useConnectedWeb3Context()
  const { account, library: provider, networkId, relay } = context

  const [claimState, setClaimState] = useState<boolean>(false)
  const [unclaimedAmount, setUnclaimedAmount] = useState<BigNumber>(Zero)
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false)
  const [txHash, setTxHash] = useState('')
  const [txState, setTxState] = useState<TransactionStep>(TransactionStep.waitingConfirmation)
  const [confirmations, setConfirmations] = useState(0)

  const { claimLatestToken } = useXdaiBridge()

  const fetchUnclaimedAssets = async () => {
    const xDaiService = new XdaiService(provider)
    const transaction = await xDaiService.fetchXdaiTransactionData()
    if (transaction) {
      setUnclaimedAmount(transaction.value)
      setClaimState(true)
      return
    }
    setClaimState(false)
  }

  useEffect(() => {
    if (relay) {
      fetchUnclaimedAssets()
    } else {
      setUnclaimedAmount(Zero)
      setClaimState(false)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, networkId])

  const claim = async () => {
    setTxState(TransactionStep.waitingConfirmation)
    setConfirmations(0)
    setIsTransactionModalOpen(true)

    const hash = await claimLatestToken()
    setTxHash(hash)

    const provider = context.rawWeb3Context.library
    await waitForConfirmations(hash, provider, setConfirmations, setTxState, 1)
    fetchUnclaimedAssets()

    setClaimState(false)
    setUnclaimedAmount(Zero)
  }

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

  const { tokens } = useTokens(context.rawWeb3Context, true, true)

  const ethBalance = new BigNumber(
    tokens.filter(token => token.symbol === 'ETH' || token.symbol === 'xDAI')[0]?.balance || '',
  )
  const formattedEthBalance = formatNumber(formatBigNumber(ethBalance, 18, 18))
  const daiBalance = new BigNumber(tokens.filter(token => token.symbol === 'DAI')[0]?.balance || '')
  const formattedDaiBalance = formatNumber(formatBigNumber(daiBalance, 18, 18))

  // TODO: Replace hardcoded state
  const walletState = WalletState.ready

  const DAI = getToken(1, 'dai')

  const nativeAsset = getNativeAsset(context.networkId)
  const { collateralBalance: maybeCollateralBalance } = useCollateralBalance(getNativeAsset(context.networkId), context)
  const balance = `${formatBigNumber(maybeCollateralBalance || Zero, nativeAsset.decimals, 2)}`
  const confirmationsRequired = 1
  return (
    <>
      <Modal isOpen={isOpen} onRequestClose={onClose} shouldCloseOnOverlayClick={true} style={theme.fluidHeightModal}>
        <ContentWrapper>
          <ModalNavigation>
            <ModalTitle>Your Connection</ModalTitle>
            <IconClose hoverEffect={true} onClick={onClose} />
          </ModalNavigation>
          <ModalCard>
            <TopCardHeader>
              <TopCardHeaderLeft>
                <ConnectionIconWrapper>
                  <ConnectorCircle>{connectorIcon}</ConnectorCircle>
                  <IconJazz account={account || ''} size={28} />
                </ConnectionIconWrapper>
                <AccountInfo>
                  <AccountInfoAddress>
                    {truncateStringInTheMiddle(context.rawWeb3Context.account || '', 5, 3)}
                  </AccountInfoAddress>
                  <AccountInfoWallet>{context.rawWeb3Context.connectorName}</AccountInfoWallet>
                </AccountInfo>
              </TopCardHeaderLeft>
              <ChangeWalletButton buttonType={ButtonType.secondaryLine} onClick={changeWallet}>
                Change
              </ChangeWalletButton>
            </TopCardHeader>
            <BalanceSection>
              <CardHeaderText>Wallet</CardHeaderText>
              <BalanceItems style={{ marginTop: '14px' }}>
                {(networkId === networkIds.MAINNET || relay) && (
                  <BalanceItem>
                    <BalanceItemSide>
                      <EtherIcon />
                      <BalanceItemTitle style={{ marginLeft: '12px' }}>Ether</BalanceItemTitle>
                    </BalanceItemSide>
                    <BalanceItemBalance>{formattedEthBalance} ETH</BalanceItemBalance>
                  </BalanceItem>
                )}
                <BalanceItem>
                  <BalanceItemSide>
                    <DaiIcon size="24px" />
                    <BalanceItemTitle style={{ marginLeft: '12px' }}>Dai</BalanceItemTitle>
                  </BalanceItemSide>
                  <BalanceItemBalance>
                    {networkId === networkIds.XDAI && !relay ? formattedEthBalance : formattedDaiBalance} DAI
                  </BalanceItemBalance>
                </BalanceItem>
                {relay && claimState && (
                  <>
                    <BalanceDivider />
                    <BalanceItem>
                      <BalanceItemSide>
                        <DaiIcon size="24px" />
                        <BalanceItemTitle style={{ marginLeft: '12px' }}>Dai</BalanceItemTitle>
                        <BalanceItemInfo>(Claimable)</BalanceItemInfo>
                      </BalanceItemSide>
                      <BalanceItemBalance>{formatBigNumber(unclaimedAmount, 18, 2)} DAI</BalanceItemBalance>
                    </BalanceItem>
                    <ClaimButton buttonType={ButtonType.primary} onClick={claim}>
                      Claim Now
                    </ClaimButton>
                  </>
                )}
              </BalanceItems>
            </BalanceSection>
          </ModalCard>
          {relay && (
            <ModalCard>
              {walletState === WalletState.ready ? (
                <>
                  <BalanceSection>
                    <CardHeaderText>Omen Account</CardHeaderText>
                    <BalanceItems style={{ marginTop: '14px' }}>
                      <BalanceItem>
                        <BalanceItemSide>
                          <DaiIcon size="24px" />
                          <BalanceItemTitle style={{ marginLeft: '12px' }}>Dai</BalanceItemTitle>
                        </BalanceItemSide>
                        <BalanceItemBalance>{balance} DAI</BalanceItemBalance>
                      </BalanceItem>
                    </BalanceItems>
                  </BalanceSection>
                  <DepositWithdrawButtons>
                    <DepositWithdrawButton buttonType={ButtonType.secondaryLine} onClick={openDepositModal}>
                      Deposit
                    </DepositWithdrawButton>
                    <DepositWithdrawButton buttonType={ButtonType.secondaryLine} onClick={openWithdrawModal}>
                      Withdraw
                    </DepositWithdrawButton>
                  </DepositWithdrawButtons>
                </>
              ) : (
                <EnableDai>
                  <DaiIcon size="38px" />
                  <EnableDaiText>To deposit DAI to your Omen account, you must first enable it.</EnableDaiText>
                  <EnableDaiButton buttonType={ButtonType.primary}>Enable</EnableDaiButton>
                </EnableDai>
              )}
            </ModalCard>
          )}
        </ContentWrapper>
      </Modal>
      <ModalTransactionWrapper
        confirmations={confirmations}
        confirmationsRequired={confirmationsRequired}
        icon={DAI.image}
        isOpen={isTransactionModalOpen}
        message={`Claim ${formatBigNumber(unclaimedAmount || new BigNumber(0), DAI.decimals)} ${DAI.symbol}`}
        onClose={() => setIsTransactionModalOpen(false)}
        txHash={txHash}
        txState={txState}
      />
    </>
  )
}

export const ModalYourConnectionWrapper = withTheme(ModalYourConnection)
