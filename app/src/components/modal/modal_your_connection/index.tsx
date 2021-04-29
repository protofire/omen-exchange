import { BigNumber } from 'ethers/utils'
import React, { HTMLAttributes, useState } from 'react'
import Modal from 'react-modal'
import styled, { withTheme } from 'styled-components'

import { DAI_TO_XDAI_TOKEN_BRIDGE_ADDRESS, STANDARD_DECIMALS } from '../../../common/constants'
import { useConnectedCPKContext, useConnectedWeb3Context } from '../../../hooks'
import { ERC20Service } from '../../../services'
import { getToken, networkIds } from '../../../util/networks'
import { formatBigNumber, truncateStringInTheMiddle, waitForConfirmations } from '../../../util/tools'
import { TransactionStep, WalletState } from '../../../util/types'
import { Button } from '../../button/button'
import { ButtonType } from '../../button/button_styling_types'
import { IconClose, IconMetaMask, IconOmen, IconWalletConnect } from '../../common/icons'
import { IconChevronDown } from '../../common/icons/IconChevronDown'
import { IconChevronUp } from '../../common/icons/IconChevronUp'
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
const StrongText = styled.div`
  font-weight: 500;
  font-size: 14px;

  line-height: 14.06px;
  color: ${props => props.theme.textfield.color};
  margin-bottom: 5px;
`

const ClaimLeft = styled.div`
  display: flex;
  flex-direction: column;
  align-self: center;
`
const ClaimRight = styled.div`
  margin-left: auto;
  display: flex;
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

const ClaimButton = styled(Button)`
  width: 72px;
  margin-left: 22px;
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
const SvgWrap = styled.div`
  align-self: center;
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
  unclaimedDaiAmount: BigNumber
  unclaimedOmenAmount: BigNumber
  fetchBalances: () => void
  formattedEthBalance: string
  formattedDaiBalance: string
  formattedOmenBalance: string
  formattedxDaiBalance: string
  formattedxOmenBalance: string
}

export const ModalYourConnection = (props: Props) => {
  const {
    changeWallet,

    fetchBalances,
    formattedDaiBalance,
    formattedEthBalance,
    formattedOmenBalance,
    formattedxDaiBalance,
    formattedxOmenBalance,
    isOpen,
    onClose,
    openDepositModal,
    openWithdrawModal,
    theme,
    unclaimedDaiAmount,
    unclaimedOmenAmount,
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
  const [displayClaim, setDisplayClaim] = useState<boolean>(false)

  const claim = async () => {
    if (!cpk) {
      return
    }

    try {
      setMessage(`Claim ${formatBigNumber(unclaimedDaiAmount || new BigNumber(0), DAI.decimals)} ${DAI.symbol}`)
      setTxState(TransactionStep.waitingConfirmation)
      setConfirmations(0)
      setIsTransactionModalOpen(true)

      const transaction = await cpk.claimDaiTokens()

      const provider = context.rawWeb3Context.library
      setTxNetId(provider.network.chainId)
      setTxHash(transaction.hash)

      await waitForConfirmations(transaction.hash, provider, setConfirmations, setTxState, 1)
      setTxState(TransactionStep.transactionConfirmed)
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
    if (!relay) {
      return
    }
    try {
      setMessage(`Enable ${DAI.symbol}`)
      setTxState(TransactionStep.waitingConfirmation)
      setConfirmations(0)
      setIsTransactionModalOpen(true)
      const provider = context.rawWeb3Context.library
      const collateralService = new ERC20Service(context.rawWeb3Context.library, owner, DAI.address)
      const { transactionHash } = await collateralService.approveUnlimited(DAI_TO_XDAI_TOKEN_BRIDGE_ADDRESS, true)
      if (transactionHash) {
        setTxNetId(provider.network.chainId)
        setTxHash(transactionHash)
        await waitForConfirmations(transactionHash, provider, setConfirmations, setTxState, 1)
        setTxState(TransactionStep.transactionConfirmed)
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
                      <IconOmen size={24} />
                      <BalanceItemTitle style={{ marginLeft: '12px' }}>Omen</BalanceItemTitle>
                    </BalanceItemSide>
                    <BalanceItemBalance>{formattedOmenBalance} OMN</BalanceItemBalance>
                  </BalanceItem>
                )}
              </BalanceItems>
            </BalanceSection>
          </ModalCard>
          {relay && (!unclaimedDaiAmount.isZero() || !unclaimedOmenAmount.isZero()) && (
            <ModalCard>
              <BalanceSection borderBottom={displayClaim} style={{ flexDirection: 'row' }}>
                <ClaimLeft>
                  <StrongText>Claimable Assets</StrongText>
                  <BalanceItemBalance as="div">
                    {unclaimedDaiAmount.isZero()
                      ? 'OMN'
                      : !unclaimedDaiAmount.isZero() && !unclaimedOmenAmount.isZero()
                      ? 'DAI, OMEN'
                      : 'DAI'}
                  </BalanceItemBalance>
                </ClaimLeft>

                <ClaimRight>
                  <SvgWrap
                    onClick={() => {
                      setDisplayClaim(!displayClaim)
                    }}
                  >
                    {displayClaim ? <IconChevronUp /> : <IconChevronDown />}
                  </SvgWrap>

                  <ClaimButton buttonType={ButtonType.primary} onClick={claim}>
                    Claim
                  </ClaimButton>
                </ClaimRight>
              </BalanceSection>

              {displayClaim && (
                <BalanceSection>
                  {!unclaimedDaiAmount.isZero() && (
                    <BalanceItem>
                      <BalanceItemSide>
                        <DaiIcon size="24px" />
                        <BalanceItemTitle style={{ marginLeft: '12px' }}>Dai</BalanceItemTitle>
                      </BalanceItemSide>
                      <BalanceItemBalance>
                        {formatBigNumber(unclaimedDaiAmount, STANDARD_DECIMALS, 2)} DAI
                      </BalanceItemBalance>
                    </BalanceItem>
                  )}
                  {!unclaimedOmenAmount.isZero() && (
                    <BalanceItem>
                      <BalanceItemSide>
                        <IconOmen size={24} />
                        <BalanceItemTitle style={{ marginLeft: '12px' }}>Omen</BalanceItemTitle>
                      </BalanceItemSide>
                      <BalanceItemBalance>
                        {formatBigNumber(unclaimedOmenAmount, STANDARD_DECIMALS, 2)} OMN
                      </BalanceItemBalance>
                    </BalanceItem>
                  )}
                </BalanceSection>
              )}
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
                          <IconOmen size={24} />
                          <BalanceItemTitle style={{ marginLeft: '12px' }}>Omen</BalanceItemTitle>
                        </BalanceItemSide>
                        <BalanceItemBalance>{formattedxOmenBalance} OMN</BalanceItemBalance>
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
