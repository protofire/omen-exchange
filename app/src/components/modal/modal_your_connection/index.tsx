import { BigNumber } from 'ethers/utils'
import React, { HTMLAttributes, useState } from 'react'
import Modal from 'react-modal'
import styled, { withTheme } from 'styled-components'

import {
  DAI_TO_XDAI_TOKEN_BRIDGE_ADDRESS,
  GEN_TOKEN_ADDDRESS_TESTING,
  GEN_XDAI_ADDRESS_TESTING,
  OMNI_BRIDGE_MAINNET_ADDRESS,
  OMNI_BRIDGE_XDAI_ADDRESS,
  STANDARD_DECIMALS,
} from '../../../common/constants'
import { useConnectedCPKContext, useConnectedWeb3Context } from '../../../hooks'
import { ERC20Service } from '../../../services'
import { getToken, networkIds } from '../../../util/networks'
import { formatBigNumber, truncateStringInTheMiddle, waitForConfirmations } from '../../../util/tools'
import { TransactionStep, WalletState } from '../../../util/types'
import { Button } from '../../button/button'
import { ButtonType } from '../../button/button_styling_types'
import { IconClose, IconMetaMask, IconOmen, IconWalletConnect } from '../../common/icons'
import { IconJazz } from '../../common/icons/IconJazz'
import { DaiIcon } from '../../common/icons/currencies'
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
  padding: 24px 20px 20px 20px;
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

const ConnectionModalNavigation = styled(ModalNavigation as any)`
  padding: 0;
  margin-bottom: 16px;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  changeWallet: () => void
  isOpen: boolean
  onClose: () => void
  openDepositModal: () => void
  openWithdrawModal: () => void
  theme?: any
  claimState: boolean
  unclaimedAmount: BigNumber
  fetchBalances: () => void
  formattedEthBalance: string
  formattedDaiBalance: string
  formattedxDaiBalance: string
}

export const ModalYourConnection = (props: Props) => {
  const {
    changeWallet,
    claimState,
    fetchBalances,
    formattedDaiBalance,
    formattedEthBalance,
    formattedxDaiBalance,
    isOpen,
    onClose,
    openDepositModal,
    openWithdrawModal,
    theme,
    unclaimedAmount,
  } = props

  const context = useConnectedWeb3Context()
  const owner = context.rawWeb3Context.account
  const cpk = useConnectedCPKContext()

  const { account, networkId, relay } = context

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false)
  const [txHash, setTxHash] = useState('')
  const [txState, setTxState] = useState<TransactionStep>(TransactionStep.waitingConfirmation)
  const [txNetId, setTxNetId] = useState()
  const [confirmations, setConfirmations] = useState(0)
  const [allowance, setAllowance] = useState<BigNumber>(new BigNumber(0))
  const [message, setMessage] = useState('')

  const claim = async () => {
    if (!cpk) {
      return
    }

    try {
      setMessage(`Claim ${formatBigNumber(unclaimedAmount || new BigNumber(0), DAI.decimals)} ${DAI.symbol}`)
      setTxState(TransactionStep.waitingConfirmation)
      setConfirmations(0)
      setIsTransactionModalOpen(true)

      const transaction = await cpk.claimDaiTokens()

      const provider = context.rawWeb3Context.library
      setTxNetId(provider.network.chainId)
      setTxHash(transaction.hash)

      await waitForConfirmations(transaction.hash, provider, setConfirmations, setTxState, 1)
      fetchBalances()
    } catch (e) {
      setIsTransactionModalOpen(false)
    }
  }

  const DAI = getToken(1, 'dai')

  const fetchAllowance = async () => {
    if (relay && owner && context.rawWeb3Context.networkId === networkIds.MAINNET) {
      const collateralService = new ERC20Service(context.rawWeb3Context.library, owner, DAI.address)
      const allowance = await collateralService.allowance(owner, DAI_TO_XDAI_TOKEN_BRIDGE_ADDRESS)
      setAllowance(allowance)
    }
  }

  const approve = async () => {
    if (relay) {
      setMessage(`Enable OMN`)
      setTxState(TransactionStep.waitingConfirmation)
      setConfirmations(0)
      setIsTransactionModalOpen(true)
      await cpk?.approveCpk(OMNI_BRIDGE_XDAI_ADDRESS, GEN_XDAI_ADDRESS_TESTING)

      return
    }
    try {
      setMessage(`Enable ${DAI.symbol}`)
      setTxState(TransactionStep.waitingConfirmation)
      setConfirmations(0)
      setIsTransactionModalOpen(true)
      const provider = context.rawWeb3Context.library
      const collateralService = new ERC20Service(context.rawWeb3Context.library, owner, GEN_TOKEN_ADDDRESS_TESTING)
      const { transactionHash } = await collateralService.approveUnlimited(OMNI_BRIDGE_MAINNET_ADDRESS, true)
      if (transactionHash) {
        setTxNetId(provider.network.chainId)
        setTxHash(transactionHash)
        await waitForConfirmations(transactionHash, provider, setConfirmations, setTxState, 1)
        await fetchAllowance()
      }
    } catch (e) {
      setIsTransactionModalOpen(false)
    }
  }

  React.useEffect(() => {
    fetchAllowance()
    // eslint-disable-next-line
  }, [relay, account])

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

  const walletState = allowance.isZero() ? WalletState.enable : WalletState.ready

  return (
    <>
      <Modal
        isOpen={isOpen && !isTransactionModalOpen}
        onRequestClose={onClose}
        shouldCloseOnOverlayClick={true}
        style={theme.fluidHeightModal}
      >
        <ContentWrapper>
          <ConnectionModalNavigation>
            <ModalTitle>Your Connection</ModalTitle>
            <IconClose hoverEffect={true} onClick={onClose} />
          </ConnectionModalNavigation>
          <ModalCard>
            <TopCardHeader>
              <TopCardHeaderLeft>
                <ConnectionIconWrapper>
                  <ConnectorCircle>{connectorIcon}</ConnectorCircle>
                  <IconJazz account={owner || ''} size={28} />
                </ConnectionIconWrapper>
                <AccountInfo>
                  <AccountInfoAddress>{truncateStringInTheMiddle(owner || '', 5, 3)}</AccountInfoAddress>
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
                <BalanceItem>
                  <BalanceItemSide>
                    <DaiIcon size="24px" />
                    <BalanceItemTitle style={{ marginLeft: '12px' }}>Dai</BalanceItemTitle>
                  </BalanceItemSide>
                  <BalanceItemBalance>
                    {networkId === networkIds.XDAI && !relay
                      ? `${formattedEthBalance} xDAI`
                      : `${formattedDaiBalance} DAI`}
                  </BalanceItemBalance>
                </BalanceItem>
                {(networkId === networkIds.MAINNET || relay) && (
                  <BalanceItem>
                    <BalanceItemSide>
                      <IconOmen size={'24'} />
                      <BalanceItemTitle style={{ marginLeft: '12px' }}>Omen</BalanceItemTitle>
                    </BalanceItemSide>
                    <BalanceItemBalance>{formattedEthBalance} OMN</BalanceItemBalance>
                  </BalanceItem>
                )}
              </BalanceItems>
            </BalanceSection>
          </ModalCard>
          {relay && claimState && (
            <ModalCard>
              <BalanceSection>
                <BalanceItem>
                  <BalanceItemSide>
                    <DaiIcon size="24px" />
                    <BalanceItemTitle style={{ marginLeft: '12px' }}>Dai</BalanceItemTitle>
                    <BalanceItemInfo>(Claimable)</BalanceItemInfo>
                  </BalanceItemSide>
                  <BalanceItemBalance>{formatBigNumber(unclaimedAmount, STANDARD_DECIMALS, 2)} DAI</BalanceItemBalance>
                </BalanceItem>
                <ClaimButton buttonType={ButtonType.primary} onClick={claim}>
                  Claim Now
                </ClaimButton>
              </BalanceSection>
            </ModalCard>
          )}
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
                        <BalanceItemBalance>{formattedxDaiBalance} DAI</BalanceItemBalance>
                      </BalanceItem>
                      <BalanceItem>
                        <BalanceItemSide>
                          <IconOmen size={'24'} />
                          <BalanceItemTitle style={{ marginLeft: '12px' }}>Omen</BalanceItemTitle>
                        </BalanceItemSide>
                        <BalanceItemBalance>{formattedxDaiBalance} OMN</BalanceItemBalance>
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
                  <EnableDaiText>
                    To Deposit or Withdraw Dai to your Omen Account, you need to enable it first.
                  </EnableDaiText>
                  <EnableDaiButton buttonType={ButtonType.primary} onClick={approve}>
                    Enable
                  </EnableDaiButton>
                </EnableDai>
              )}
            </ModalCard>
          )}
          <EnableDai>
            <DaiIcon size="38px" />
            <EnableDaiText>To Deposit or Withdraw Dai to your Omen Account, you need to enable it first.</EnableDaiText>
            <EnableDaiButton buttonType={ButtonType.primary} onClick={approve}>
              Enable
            </EnableDaiButton>
          </EnableDai>
        </ContentWrapper>
      </Modal>
      <ModalTransactionWrapper
        confirmations={confirmations}
        confirmationsRequired={1}
        icon={DAI.image}
        isOpen={isTransactionModalOpen}
        message={message}
        netId={txNetId}
        onClose={() => setIsTransactionModalOpen(false)}
        txHash={txHash}
        txState={txState}
      />
    </>
  )
}

export const ModalYourConnectionWrapper = withTheme(ModalYourConnection)
