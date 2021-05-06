import { Zero } from 'ethers/constants'
import { BigNumber, parseEther } from 'ethers/utils'
import React, { HTMLAttributes, useEffect, useState } from 'react'
import Modal from 'react-modal'
import ReactTooltip from 'react-tooltip'
import styled, { withTheme } from 'styled-components'

import {
  DAI_TO_XDAI_TOKEN_BRIDGE_ADDRESS,
  OMNI_BRIDGE_MAINNET_ADDRESS,
  STANDARD_DECIMALS,
} from '../../../common/constants'
import { useConnectedCPKContext, useConnectedWeb3Context } from '../../../hooks'
import { ERC20Service, XdaiService } from '../../../services'
import { getToken, networkIds } from '../../../util/networks'
import { formatBigNumber, formatNumber, waitForConfirmations } from '../../../util/tools'
import { ExchangeCurrency, ExchangeType, TransactionStep, WalletState } from '../../../util/types'
import { Button, ButtonStateful } from '../../button'
import { ButtonStates } from '../../button/button_stateful'
import { ButtonType } from '../../button/button_styling_types'
import { BigNumberInput, RadioInput, TextfieldCustomPlaceholder } from '../../common'
import { BigNumberInputReturn } from '../../common/form/big_number_input'
import { IconArrowBack, IconClose, IconOmen } from '../../common/icons'
import { IconAlertInverted } from '../../common/icons/IconAlertInverted'
import { IconQuestion } from '../../common/icons/IconQuestion'
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

const InputInfo = styled.div`
  font-size: ${props => props.theme.fonts.defaultSize};
  color: ${props => props.theme.colors.textColorLighter};

  width: 100%;
  margin-bottom: auto;
  margin-top: 20px;
  display: -webkit-box;
  align-items: center;
  border: ${props => props.theme.borders.borderLineDisabled};
  border-radius: 4px;
  padding: ${props => props.theme.textfield.paddingVertical + ' ' + props.theme.textfield.paddingHorizontal};
  line-height: 20px;
  letter-spacing: 0.2px;
`
const WalletText = styled.div`
  margin-bottom: 14px;
  color: ${props => props.theme.colors.textColorLighter};
  line-height: 16.41px;
  letter-spacing: 0.2px;
`

const DepositWithdrawButton = styled(Button)`
  flex: 1;
`
const ApproveButton = styled(ButtonStateful)`
  flex: 1;
  margin-right: 16px;
`
// const ExchangeData = styled.div`
//   display: flex;
//   flex-direction: column;
//   flex: 1;
// `
const ExchangeDataItem = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  line-height: 16px;
  letter-spacing: 0.2px;
  color: ${props => props.theme.colors.textColorLightish};
`

const Allowance = styled.div`
  display: flex;
  margin-top: 20px;
  padding: 16px 20px;
  border-radius: 4px;
  border: ${props => props.theme.borders.borderLineDisabled};
  line-height: 20px;
  letter-spacing: 0.2px;
  color: ${props => props.theme.colors.textColorLightish};
  align-items: center;
`
const BottomButtons = styled.div`
  display: flex;
  margin-top: auto;
  width: 100%;
`
const Divider = styled.div`
  border-bottom: ${props => props.theme.borders.borderLineDisabled};
  width: 100%;
  margin: 24px 0;
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
  const [allowanceState, setAllowanceState] = useState<ButtonStates>(ButtonStates.idle)
  const [omenAllowance, setOmenWalletAllowance] = useState<BigNumber>(Zero)
  const [daiAllowance, setDaiAllowance] = useState<BigNumber>(Zero)

  const { account, relay } = context.rawWeb3Context

  const fetchAllowance = async () => {
    if (
      context.relay &&
      account &&
      context.rawWeb3Context.networkId === networkIds.MAINNET &&
      exchangeType === ExchangeType.deposit
    ) {
      const omenCollalteralService = new ERC20Service(context.rawWeb3Context.library, account, omenToken.address)
      const omenAllowance = await omenCollalteralService.allowance(account, OMNI_BRIDGE_MAINNET_ADDRESS)
      const daiCollateralService = new ERC20Service(context.rawWeb3Context.library, account, DAI.address)
      const daiAllowance = await daiCollateralService.allowance(account, DAI_TO_XDAI_TOKEN_BRIDGE_ADDRESS)
      setDaiAllowance(daiAllowance)
      setOmenWalletAllowance(omenAllowance)
    }
  }

  const approve = async () => {
    setAllowanceState(ButtonStates.working)
    try {
      if (exchangeType === ExchangeType.deposit) {
        if (currencySelected === ExchangeCurrency.Omen) {
          const collateralService = new ERC20Service(context.rawWeb3Context.library, account, omenToken.address)

          await collateralService.approveUnlimited(OMNI_BRIDGE_MAINNET_ADDRESS)
        } else {
          const collateralService = new ERC20Service(context.rawWeb3Context.library, account, omenToken.address)

          await collateralService.approveUnlimited(OMNI_BRIDGE_MAINNET_ADDRESS)
          console.log('awaiting logic for dai enable')
        }
      }

      setAllowanceState(ButtonStates.finished)
      await fetchAllowance()
    } catch (e) {
      setAllowanceState(ButtonStates.idle)
    }
  }
  const omenWalletAllowance =
    omenAllowance.isZero() && exchangeType === ExchangeType.deposit && currencySelected === ExchangeCurrency.Omen
      ? true
      : false
  const daiWalletAllowance =
    daiAllowance.isZero() && exchangeType === ExchangeType.deposit && currencySelected === ExchangeCurrency.Dai
      ? true
      : false

  React.useEffect(() => {
    Modal.setAppElement('#root')
  }, [])

  useEffect(() => {
    fetchAllowance()
    setDisplayFundAmount(Zero)
    setAmountToDisplay(' ')

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, relay, exchangeType, currencySelected])

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
    displayFundAmount.lt(currencySelected === ExchangeCurrency.Dai ? minDaiExchange : minOmenExchange) ||
    (currencySelected === ExchangeCurrency.Omen &&
      exchangeType === ExchangeType.deposit &&
      displayFundAmount.gt(omenAllowance)) ||
    (currencySelected === ExchangeCurrency.Omen && exchangeType === ExchangeType.withdraw && xDaiBalance?.isZero())

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
      setConfirmations(9)
      setIsTransactionModalOpen(true)

      const hash =
        exchangeType === ExchangeType.deposit
          ? await cpk.sendMainnetTokenToBridge(displayFundAmount, currencySelected)
          : await cpk.sendXdaiChainTokenToBridge(displayFundAmount, currencySelected)

      const provider = exchangeType === ExchangeType.deposit ? context.rawWeb3Context.library : context.library

      setTxNetId(provider.network.chainId)
      setTxHash(hash)

      await waitForConfirmations(hash, provider, setConfirmations, setTxState)

      if (exchangeType === ExchangeType.deposit && currencySelected === ExchangeCurrency.Omen) {
        await XdaiService.waitForBridgeMessageStatus(hash, context.library)
      }

      await fetchBalances()

      setIsTransactionModalOpen(false)
      onBack()
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

      const transaction = await cpk.claimAllTokens()

      const provider = context.rawWeb3Context.library
      setTxNetId(provider.network.chainId)
      setTxHash(transaction.hash)
      await waitForConfirmations(transaction.hash, provider, setConfirmations, setTxState, 1)
      setTxState(TransactionStep.transactionConfirmed)
      await fetchBalances()
    } catch (e) {
      setIsTransactionModalOpen(false)
      setIsClaimModalOpen(true)
    }
  }
  console.log(xDaiBalance?.isZero())

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
          <ModalCard style={{ marginBottom: '20px', marginTop: '10px' }}>
            <BalanceSection>
              <WalletText>Wallet</WalletText>
              <BalanceItems>
                <BalanceItem
                  hover
                  onClick={() => {
                    setCurrencySelected(ExchangeCurrency.Dai)
                  }}
                >
                  <BalanceItemSide>
                    <RadioInput
                      checked={currencySelected === ExchangeCurrency.Dai}
                      name={'Dai'}
                      outcomeIndex={-1}
                      readOnly
                    />
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
                  hover
                  onClick={() => {
                    setCurrencySelected(ExchangeCurrency.Omen)
                  }}
                >
                  <BalanceItemSide>
                    <RadioInput
                      checked={currencySelected === ExchangeCurrency.Omen}
                      name={'Dai'}
                      outcomeIndex={-2}
                      readOnly
                    />
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
                (exchangeType === ExchangeType.deposit
                  ? currencySelected === ExchangeCurrency.Dai
                    ? daiBalance
                    : omenBalance
                  : currencySelected === ExchangeCurrency.Dai
                  ? xDaiBalance
                  : xOmenBalance) || Zero
              setDisplayFundAmount(maxBalance)
              setAmountToDisplay(formatBigNumber(maxBalance, STANDARD_DECIMALS, 5))
            }}
            shouldDisplayMaxButton={true}
            symbol={currencySelected === ExchangeCurrency.Dai ? 'DAI' : 'OMN'}
          />
          {exchangeType === ExchangeType.withdraw &&
          currencySelected === ExchangeCurrency.Omen &&
          xDaiBalance?.isZero() ? (
            <InputInfo>
              <IconAlertInverted />
              <div style={{ marginLeft: '12px' }}>Fund your Omen Account with Dai to proceed with the withdrawal.</div>
            </InputInfo>
          ) : (
            <>
              <ExchangeDataItem style={{ marginTop: '32px' }}>
                <span>Min amount</span>
                <span>
                  {currencySelected === ExchangeCurrency.Dai
                    ? `${formatBigNumber(minDaiExchange, STANDARD_DECIMALS, 2)} DAI`
                    : `${formatBigNumber(minOmenExchange, omenToken.decimals, 2)} OMN`}
                </span>
              </ExchangeDataItem>
              <ExchangeDataItem style={{ marginTop: '12px' }}>
                <div
                  data-arrow-color="transparent"
                  data-for="feeInfo"
                  data-tip={`Bridge Fee ${
                    currencySelected === ExchangeCurrency.Omen && exchangeType === ExchangeType.withdraw
                      ? '0.10%'
                      : '0.00%'
                  }`}
                >
                  {exchangeType === ExchangeType.withdraw ? 'Withdraw' : 'Deposit'} Fee
                  <IconQuestion style={{ marginLeft: '8px' }} />
                </div>

                <span>
                  {currencySelected === ExchangeCurrency.Dai
                    ? '0.00 DAI'
                    : exchangeType === ExchangeType.withdraw
                    ? `${formatNumber(formatBigNumber(displayFundAmount.div(1000), omenToken.decimals, 3), 2)} OMN`
                    : '0.00 OMN'}
                </span>
              </ExchangeDataItem>
              <Divider />
              <ExchangeDataItem>
                <span>Total</span>
                <span>
                  {currencySelected === ExchangeCurrency.Omen && exchangeType === ExchangeType.withdraw
                    ? `${formatBigNumber(
                        displayFundAmount.sub(displayFundAmount.div(1000)),
                        omenToken.decimals,
                        3,
                      )} OMN`
                    : `${formatBigNumber(displayFundAmount, STANDARD_DECIMALS, 2)} ${
                        currencySelected === ExchangeCurrency.Omen ? 'OMN' : 'DAI'
                      }`}
                </span>
              </ExchangeDataItem>
            </>
          )}

          <BottomButtons>
            {(currencySelected === ExchangeCurrency.Dai ? daiWalletAllowance : omenWalletAllowance) && (
              <ApproveButton extraText onClick={approve} state={allowanceState}>
                {allowanceState === ButtonStates.idle &&
                  `Approve ${currencySelected === ExchangeCurrency.Dai ? 'DAI' : 'OMN'}`}
                {allowanceState === ButtonStates.working && 'Approving'}
                {allowanceState === ButtonStates.finished && 'Approved'}
              </ApproveButton>
            )}

            <DepositWithdrawButton
              buttonType={ButtonType.primaryAlternative}
              disabled={isDepositWithdrawDisabled}
              onClick={depositWithdraw}
            >
              {exchangeType}
            </DepositWithdrawButton>
          </BottomButtons>
        </ContentWrapper>
        <ReactTooltip
          className="customMarketTooltip"
          data-multiline={true}
          effect="solid"
          id="feeInfo"
          offset={{ top: 0, left: -42 }}
          place="top"
          type="light"
        />
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
