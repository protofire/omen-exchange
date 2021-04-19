import { Zero } from 'ethers/constants'
import { BigNumber, parseEther } from 'ethers/utils'
import React, { HTMLAttributes, useEffect, useState } from 'react'
import Modal from 'react-modal'
import styled, { withTheme } from 'styled-components'

import { OMNI_BRIDGE_MAINNET_ADDRESS, STANDARD_DECIMALS } from '../../../common/constants'
import { useConnectedCPKContext, useConnectedWeb3Context } from '../../../hooks'
import { ERC20Service } from '../../../services'
import { getToken, networkIds } from '../../../util/networks'
import { formatBigNumber, waitForConfirmations } from '../../../util/tools'
import { ExchangeCurrency, ExchangeType, TransactionStep, WalletState } from '../../../util/types'
import { Button } from '../../button'
import { ButtonType } from '../../button/button_styling_types'
import { BigNumberInput, RadioInput, TextfieldCustomPlaceholder } from '../../common'
import { BigNumberInputReturn } from '../../common/form/big_number_input'
import { IconArrowBack, IconClose, IconOmen } from '../../common/icons'
import { IconAlertInverted } from '../../common/icons/IconAlertInverted'
import { DaiIcon } from '../../common/icons/currencies'
import { ToggleTokenLock } from '../../market/common/toggle_token_lock'
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
  margin: 12px 0 0;
  width: 100%;

  display: flex;
  align-items: center;
  border: ${props => props.theme.borders.borderLineDisabled};
  border-radius: 4px;
  padding: ${props => props.theme.textfield.paddingVertical + ' ' + props.theme.textfield.paddingHorizontal};
  line-height: 16.41px;
  letter-spacing: 0.2px;
`
const WalletText = styled.div`
  margin-bottom: 14px;
  color: ${props => props.theme.colors.textColorLighter};
  line-height: 16.41px;
  letter-spacing: 0.2px;
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
  formattedOmenBalance: string
  daiBalance: BigNumber
  xDaiBalance: Maybe<BigNumber>
  xOmenBalance: BigNumber
  unclaimedAmount: BigNumber
  formattedxOmenBalance: string
  omenBalance: BigNumber
}

export const ModalDepositWithdraw = (props: Props) => {
  const {
    daiBalance,
    exchangeType,
    fetchBalances,
    formattedDaiBalance,
    formattedOmenBalance,
    formattedxDaiBalance,
    formattedxOmenBalance,
    isOpen,
    omenBalance,
    onBack,
    onClose,
    theme,
    unclaimedAmount,
    xDaiBalance,
    xOmenBalance,
  } = props
  const context = useConnectedWeb3Context()
  const cpk = useConnectedCPKContext()
  const omenToken = getToken(1, 'omn')

  const [displayFundAmount, setDisplayFundAmount] = useState<BigNumber>(new BigNumber(0))
  const [amountToDisplay, setAmountToDisplay] = useState<string>('')
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false)
  const [isClaimModalOpen, setIsClaimModalOpen] = useState<boolean>(false)
  const [txHash, setTxHash] = useState('')
  const [txState, setTxState] = useState<TransactionStep>(TransactionStep.waitingConfirmation)
  const [txNetId, setTxNetId] = useState()
  const [confirmations, setConfirmations] = useState(0)
  const [message, setMessage] = useState('')
  const [currencySelected, setCurrencySelected] = useState<ExchangeCurrency>(ExchangeCurrency.Dai)
  const [allowanceState, setAllowanceState] = useState<TransactionStep>(TransactionStep.idle)
  const [mainnetAllowance, setMainnetAllowance] = useState<BigNumber>(new BigNumber(0))

  const { account, relay } = context.rawWeb3Context

  const fetchAllowance = async () => {
    if (
      context.relay &&
      account &&
      context.rawWeb3Context.networkId === networkIds.MAINNET &&
      exchangeType === ExchangeType.deposit
    ) {
      const collateralService = new ERC20Service(context.rawWeb3Context.library, account, omenToken.address)
      const allowance = await collateralService.allowance(account, OMNI_BRIDGE_MAINNET_ADDRESS)

      setMainnetAllowance(allowance)
    }
  }

  const approve = async () => {
    setAllowanceState(TransactionStep.waitingConfirmation)
    try {
      if (exchangeType === ExchangeType.deposit) {
        const collateralService = new ERC20Service(context.rawWeb3Context.library, account, omenToken.address)

        await collateralService.approveUnlimited(OMNI_BRIDGE_MAINNET_ADDRESS)
      }
      await fetchAllowance()
      setAllowanceState(TransactionStep.transactionConfirmed)
    } catch (e) {
      setAllowanceState(TransactionStep.idle)
    }
  }
  const mainnetWalletAllowance =
    mainnetAllowance.isZero() && exchangeType === ExchangeType.deposit && currencySelected === ExchangeCurrency.Omen
      ? WalletState.enable
      : WalletState.ready

  React.useEffect(() => {
    Modal.setAppElement('#root')
  }, [])

  useEffect(() => {
    fetchAllowance()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, relay, exchangeType])

  const DAI = getToken(1, 'dai')

  const wallet =
    exchangeType === ExchangeType.deposit
      ? currencySelected === ExchangeCurrency.Dai
        ? daiBalance
        : omenBalance
      : currencySelected === ExchangeCurrency.Dai
      ? xDaiBalance
      : xOmenBalance

  const minDaiExchange = exchangeType === ExchangeType.deposit ? parseEther('5') : parseEther('10')
  const minOmenExchange = exchangeType === ExchangeType.deposit ? parseEther('1') : parseEther('1')
  const isDepositWithdrawDisabled =
    displayFundAmount.isZero() ||
    !wallet ||
    displayFundAmount.gt(wallet) ||
    displayFundAmount.isZero() ||
    !wallet ||
    displayFundAmount.gt(wallet) ||
    displayFundAmount.lt(currencySelected === ExchangeCurrency.Dai ? minDaiExchange : minOmenExchange) ||
    (currencySelected === ExchangeCurrency.Omen &&
      exchangeType === ExchangeType.deposit &&
      displayFundAmount.gt(mainnetAllowance))

  const depositWithdraw = async () => {
    if (!cpk) {
      return
    }

    try {
      setMessage(
        `${exchangeType} ${formatBigNumber(displayFundAmount || new BigNumber(0), DAI.decimals)} ${
          currencySelected === ExchangeCurrency.Dai ? DAI.symbol : 'OMN'
        }`,
      )
      setTxState(TransactionStep.waitingConfirmation)
      setConfirmations(0)
      setIsTransactionModalOpen(true)

      const hash =
        exchangeType === ExchangeType.deposit
          ? await cpk.sendDaiToBridge(displayFundAmount, currencySelected)
          : await cpk.sendXdaiToBridge(displayFundAmount, currencySelected)

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
              <ModalTitle style={{ marginLeft: '16px' }}>{exchangeType} Asset</ModalTitle>
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
              <WalletText>Wallet</WalletText>
              <BalanceItems>
                <BalanceItem
                  onClick={() => {
                    setCurrencySelected(ExchangeCurrency.Dai)
                  }}
                >
                  <BalanceItemSide>
                    <RadioInput checked={currencySelected === ExchangeCurrency.Dai} name={'Dai'} outcomeIndex={-1} />
                    <DaiIcon size="24px" style={{ marginLeft: '12px', marginRight: '12px' }} />
                    <BalanceItemTitle notSelected={currencySelected !== ExchangeCurrency.Dai}>Dai</BalanceItemTitle>
                  </BalanceItemSide>
                  <BalanceItemSide>
                    <BalanceItemBalance>
                      {exchangeType === ExchangeType.deposit ? formattedDaiBalance : formattedxDaiBalance} DAI
                    </BalanceItemBalance>
                  </BalanceItemSide>
                </BalanceItem>
                <BalanceItem
                  onClick={() => {
                    setCurrencySelected(ExchangeCurrency.Omen)
                  }}
                >
                  <BalanceItemSide>
                    <RadioInput checked={currencySelected === ExchangeCurrency.Omen} name={'Dai'} outcomeIndex={-1} />
                    {/*<IconOmen size="24" style={{ marginLeft: '12px', marginRight: '12px' }} />*/}
                    <IconOmen size={24} style={{ marginLeft: '12px', marginRight: '12px' }} />
                    <BalanceItemTitle notSelected={currencySelected !== ExchangeCurrency.Omen}>Omen</BalanceItemTitle>
                  </BalanceItemSide>
                  <BalanceItemSide>
                    <BalanceItemBalance>
                      {exchangeType === ExchangeType.deposit ? formattedOmenBalance : formattedxOmenBalance} OMN
                    </BalanceItemBalance>
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
              const maxBalance =
                exchangeType === ExchangeType.deposit
                  ? currencySelected === ExchangeCurrency.Dai
                    ? daiBalance
                    : omenBalance
                  : xDaiBalance || Zero
              setDisplayFundAmount(maxBalance)
              setAmountToDisplay(formatBigNumber(maxBalance, STANDARD_DECIMALS, 5))
            }}
            shouldDisplayMaxButton={true}
            symbol={currencySelected === ExchangeCurrency.Dai ? 'DAI' : 'OMN'}
          />

          <InputInfo>
            <IconAlertInverted style={{ marginRight: '12px' }} />
            You need to {exchangeType === ExchangeType.deposit ? 'deposit' : 'withdraw'} at least{' '}
            {formatBigNumber(
              currencySelected === ExchangeCurrency.Dai ? minDaiExchange : minOmenExchange,
              STANDARD_DECIMALS,
              0,
            )}{' '}
            {currencySelected === ExchangeCurrency.Dai ? 'Dai' : 'Omn'}.
          </InputInfo>
          {mainnetWalletAllowance === WalletState.enable && (
            <div style={{ display: 'flex' }}>
              <ToggleTokenLock
                finished={allowanceState === TransactionStep.transactionConfirmed}
                loading={allowanceState === TransactionStep.waitingConfirmation}
                onUnlock={approve}
              />

              <div>This permission allows Omni Bridge smart contracts to interact with your OMN.</div>
            </div>
          )}

          <DepositWithdrawButton
            buttonType={ButtonType.primaryAlternative}
            disabled={isDepositWithdrawDisabled}
            onClick={depositWithdraw}
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
          onClose()
        }}
      />
      <ModalTransactionWrapper
        confirmations={confirmations}
        icon={
          currencySelected === ExchangeCurrency.Dai ? (
            <DaiIcon size={'24'} style={{ marginLeft: '10px' }} />
          ) : (
            <IconOmen size={24} style={{ marginLeft: '10px' }} />
          )
        }
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
