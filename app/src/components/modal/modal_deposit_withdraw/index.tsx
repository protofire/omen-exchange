import { Zero } from 'ethers/constants'
import { BigNumber, parseEther } from 'ethers/utils'
import React, { HTMLAttributes, useState } from 'react'
import Modal from 'react-modal'
import styled, { withTheme } from 'styled-components'

import { STANDARD_DECIMALS } from '../../../common/constants'
import { useConnectedCPKContext, useConnectedWeb3Context } from '../../../hooks'
import { getToken } from '../../../util/networks'
import { formatBigNumber, waitForConfirmations } from '../../../util/tools'
import { ExchangeType, TransactionStep } from '../../../util/types'
import { Button } from '../../button'
import { ButtonType } from '../../button/button_styling_types'
import { BigNumberInput, TextfieldCustomPlaceholder } from '../../common'
import { BigNumberInputReturn } from '../../common/form/big_number_input'
import { IconArrowBack, IconClose } from '../../common/icons'
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
  ModalNavigationLeft,
  ModalTitle,
} from '../common_styled'
import { ModalClaimWrapper } from '../modal_claim'
import { ModalTransactionWrapper } from '../modal_transaction'

const InputInfo = styled.p`
  font-size: ${props => props.theme.fonts.defaultSize};
  color: ${props => props.theme.colors.textColorLighter};
  margin: 0;
  margin-top: 12px;
  width: 100%;
`

const DepositWithdrawButton = styled(Button)`
  width: 100%;
  margin-top: 28px;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  exchangeType: ExchangeType
  isOpen: boolean
  onBack: () => void
  onClose: () => void
  theme?: any
  fetchBalances: () => void
  formattedDaiBalance: string
  formattedxDaiBalance: string
  daiBalance: BigNumber
  xDaiBalance: Maybe<BigNumber>
  unclaimedAmount: BigNumber
}

export const ModalDepositWithdraw = (props: Props) => {
  const {
    daiBalance,
    exchangeType,
    fetchBalances,
    formattedDaiBalance,
    formattedxDaiBalance,
    isOpen,
    onBack,
    onClose,
    theme,
    unclaimedAmount,
    xDaiBalance,
  } = props
  const context = useConnectedWeb3Context()
  const cpk = useConnectedCPKContext()

  const [displayFundAmount, setDisplayFundAmount] = useState<BigNumber>(new BigNumber(0))
  const [amountToDisplay, setAmountToDisplay] = useState<string>('')
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false)
  const [isClaimModalOpen, setIsClaimModalOpen] = useState<boolean>(false)
  const [txHash, setTxHash] = useState('')
  const [txState, setTxState] = useState<TransactionStep>(TransactionStep.waitingConfirmation)
  const [txNetId, setTxNetId] = useState()
  const [confirmations, setConfirmations] = useState(0)
  const [message, setMessage] = useState('')

  React.useEffect(() => {
    Modal.setAppElement('#root')
  }, [])

  const DAI = getToken(1, 'dai')

  const wallet = exchangeType === ExchangeType.deposit ? daiBalance : xDaiBalance
  const minDeposit = exchangeType === ExchangeType.deposit ? parseEther('0.005') : parseEther('10')
  const isDepositWithdrawDisabled =
    displayFundAmount.isZero() || !wallet || displayFundAmount.gt(wallet) || displayFundAmount.lt(minDeposit)

  const deposit = async () => {
    if (!cpk) {
      return
    }

    try {
      setMessage(
        `${exchangeType} ${formatBigNumber(displayFundAmount || new BigNumber(0), DAI.decimals)} ${DAI.symbol}`,
      )
      setTxState(TransactionStep.waitingConfirmation)
      setConfirmations(0)
      setIsTransactionModalOpen(true)

      const hash =
        exchangeType === ExchangeType.deposit
          ? await cpk.sendDaiToBridge(displayFundAmount)
          : await cpk.sendXdaiToBridge(displayFundAmount)

      const provider = exchangeType === ExchangeType.deposit ? context.rawWeb3Context.library : context.library
      setTxNetId(provider.network.chainId)
      setTxHash(hash)
      await waitForConfirmations(hash, provider, setConfirmations, setTxState)
      await fetchBalances()
      if (exchangeType === ExchangeType.withdraw) {
        setIsTransactionModalOpen(false)
        setIsClaimModalOpen(true)
      }
      setDisplayFundAmount(new BigNumber(0))
      setAmountToDisplay('')
    } catch (e) {
      setIsTransactionModalOpen(false)
    }
  }

  const claim = async () => {
    if (!cpk) {
      return
    }

    try {
      setMessage(`Claim ${formatBigNumber(unclaimedAmount || new BigNumber(0), DAI.decimals)} ${DAI.symbol}`)
      setTxState(TransactionStep.waitingConfirmation)
      setConfirmations(0)
      setIsTransactionModalOpen(true)
      setIsClaimModalOpen(false)

      const transaction = await cpk.claimDaiTokens()

      const provider = context.rawWeb3Context.library
      setTxNetId(provider.network.chainId)
      setTxHash(transaction.hash)
      await waitForConfirmations(transaction.hash, provider, setConfirmations, setTxState, 1)
      fetchBalances()
    } catch (e) {
      setIsTransactionModalOpen(false)
      setIsClaimModalOpen(true)
    }
  }

  return (
    <>
      <Modal
        isOpen={isOpen && !isTransactionModalOpen && !isClaimModalOpen}
        onRequestClose={onClose}
        shouldCloseOnOverlayClick={true}
        style={theme.fluidHeightModal}
      >
        <ContentWrapper>
          <ModalNavigation>
            <ModalNavigationLeft>
              <IconArrowBack
                hoverEffect={true}
                onClick={() => {
                  onBack()
                  setDisplayFundAmount(new BigNumber(0))
                  setAmountToDisplay('')
                }}
              />
              <ModalTitle style={{ marginLeft: '16px' }}>{exchangeType} Dai</ModalTitle>
            </ModalNavigationLeft>
            <IconClose
              hoverEffect={true}
              onClick={() => {
                onClose()
                setDisplayFundAmount(new BigNumber(0))
                setAmountToDisplay('')
              }}
            />
          </ModalNavigation>
          <ModalCard style={{ marginBottom: '16px', marginTop: '12px' }}>
            <BalanceSection>
              <BalanceItems>
                <BalanceItem>
                  <BalanceItemSide>
                    <BalanceItemTitle>Wallet</BalanceItemTitle>
                  </BalanceItemSide>
                  <BalanceItemSide>
                    <BalanceItemBalance style={{ marginRight: '12px' }}>{formattedDaiBalance} DAI</BalanceItemBalance>
                    <DaiIcon size="24px" />
                  </BalanceItemSide>
                </BalanceItem>
                <BalanceItem>
                  <BalanceItemSide>
                    <BalanceItemTitle>Omen Account</BalanceItemTitle>
                  </BalanceItemSide>
                  <BalanceItemSide>
                    <BalanceItemBalance style={{ marginRight: '12px' }}>{formattedxDaiBalance} DAI</BalanceItemBalance>
                    <DaiIcon size="24px" />
                  </BalanceItemSide>
                </BalanceItem>
              </BalanceItems>
            </BalanceSection>
          </ModalCard>
          <TextfieldCustomPlaceholder
            formField={
              <BigNumberInput
                decimals={STANDARD_DECIMALS}
                name="amount"
                onChange={(e: BigNumberInputReturn) => {
                  setDisplayFundAmount(e.value)
                  setAmountToDisplay('')
                }}
                value={displayFundAmount}
                valueToDisplay={amountToDisplay}
              />
            }
            onClickMaxButton={() => {
              const maxBalance = exchangeType === ExchangeType.deposit ? daiBalance : xDaiBalance || Zero
              setDisplayFundAmount(maxBalance)
              setAmountToDisplay(formatBigNumber(maxBalance, STANDARD_DECIMALS, 5))
            }}
            shouldDisplayMaxButton={true}
            symbol={'DAI'}
          />
          <InputInfo>
            You need to {exchangeType === ExchangeType.deposit ? 'deposit' : 'withdraw'} at least{' '}
            {formatBigNumber(minDeposit, STANDARD_DECIMALS, exchangeType === ExchangeType.deposit ? 3 : 0)} DAI.
          </InputInfo>
          <DepositWithdrawButton
            buttonType={ButtonType.primaryAlternative}
            disabled={isDepositWithdrawDisabled}
            onClick={deposit}
          >
            {exchangeType}
          </DepositWithdrawButton>
        </ContentWrapper>
      </Modal>
      <ModalClaimWrapper
        isOpen={isClaimModalOpen && !isTransactionModalOpen}
        message={`Claim ${formatBigNumber(unclaimedAmount, STANDARD_DECIMALS)} DAI`}
        onClick={() => {
          claim()
        }}
        onClose={() => {
          setIsClaimModalOpen(false)
        }}
      />
      <ModalTransactionWrapper
        confirmations={confirmations}
        icon={DAI.image}
        isOpen={isTransactionModalOpen && !isClaimModalOpen}
        message={message}
        netId={txNetId}
        onClose={() => {
          setIsTransactionModalOpen(false)
          onClose()
        }}
        txHash={txHash}
        txState={txState}
      />
    </>
  )
}

export const ModalDepositWithdrawWrapper = withTheme(ModalDepositWithdraw)
