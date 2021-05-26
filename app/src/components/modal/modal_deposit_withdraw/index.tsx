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
import { bridgeTokensList, getToken, networkIds } from '../../../util/networks'
import { getImageUrl } from '../../../util/token'
import { formatBigNumber, formatNumber, waitForConfirmations } from '../../../util/tools'
import { ExchangeType, Token, TransactionStep } from '../../../util/types'
import { Button, ButtonStateful } from '../../button'
import { ButtonStates } from '../../button/button_stateful'
import { ButtonType } from '../../button/button_styling_types'
import { BigNumberInput, RadioInput, TextfieldCustomPlaceholder } from '../../common'
import { BigNumberInputReturn } from '../../common/form/big_number_input'
import { IconArrowBack, IconClose } from '../../common/icons'
import { IconAlertInverted } from '../../common/icons/IconAlertInverted'
import { IconInfo } from '../../common/tooltip/img/IconInfo'
import { Image } from '../../market/common/token_item'
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
  border-color: ${props => props.theme.buttonSecondary.color};

  margin-right: 16px;
  &:hover {
    background-color: ${props => props.theme.colors.primaryLight};
  }
`

const ExchangeDataItem = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  line-height: ${props => props.theme.fonts.defaultLineHeight};
  letter-spacing: 0.2px;
  color: ${props => props.theme.colors.textColorLightish};
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

  xDaiBalance: Maybe<BigNumber>

  formattedxOmenBalance: string

  mainnetTokens: Token[]
  xDaiTokens: Token[]
}

export const ModalDepositWithdraw = (props: Props) => {
  const {
    exchangeType,
    fetchBalances,
    isOpen,
    mainnetTokens,
    onBack,
    onClose,
    theme,

    xDaiBalance,
    xDaiTokens,
  } = props

  const context = useConnectedWeb3Context()
  const cpk = useConnectedCPKContext()

  const [currencySelected, setCurrencySelected] = useState<KnownToken>('dai')

  const { address, decimals, symbol } = getToken(
    exchangeType === ExchangeType.deposit ? networkIds.MAINNET : networkIds.XDAI,
    currencySelected,
  )

  const currentTokenMainnet = mainnetTokens.find(element => element.symbol === symbol)

  const [displayFundAmount, setDisplayFundAmount] = useState<BigNumber>(new BigNumber(0))
  const [amountToDisplay, setAmountToDisplay] = useState<string>('')
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false)

  const [txHash, setTxHash] = useState('')
  const [txState, setTxState] = useState<TransactionStep>(TransactionStep.waitingConfirmation)
  const [txNetId, setTxNetId] = useState()
  const [confirmations, setConfirmations] = useState(0)
  const [message, setMessage] = useState('')

  const [initiatedAllowanceState, setInitiatedAllowanceState] = useState<ButtonStates>(ButtonStates.idle)

  const { account, relay } = context.rawWeb3Context

  const findCurrentTokenBasedOnAction = (exchange: ExchangeType, symbol: string): Token | undefined => {
    if (exchange === ExchangeType.deposit) return mainnetTokens.find(token => token.symbol === symbol)
    else return xDaiTokens.find(token => token.symbol === (symbol === 'DAI' ? 'xDAI' : symbol))
  }
  const currentToken = findCurrentTokenBasedOnAction(exchangeType, symbol)?.balance

  const isApprovalVisible =
    (exchangeType === ExchangeType.deposit &&
      currentTokenMainnet &&
      new BigNumber(currentTokenMainnet.allowance ? currentTokenMainnet.allowance : '0').isZero()) ||
    (initiatedAllowanceState === ButtonStates.finished &&
      currentTokenMainnet &&
      !new BigNumber(currentTokenMainnet.allowance ? currentTokenMainnet.allowance : '0').isZero())

  const approve = async () => {
    try {
      setInitiatedAllowanceState(ButtonStates.working)
      if (exchangeType === ExchangeType.deposit) {
        if (currencySelected === 'dai') {
          const collateralService = new ERC20Service(context.rawWeb3Context.library, account, address)

          await collateralService.approveUnlimited(DAI_TO_XDAI_TOKEN_BRIDGE_ADDRESS)
        } else {
          const collateralService = new ERC20Service(context.rawWeb3Context.library, account, address)

          await collateralService.approveUnlimited(OMNI_BRIDGE_MAINNET_ADDRESS)
        }
      }
      await fetchBalances()
      setInitiatedAllowanceState(ButtonStates.finished)
    } catch {
      setInitiatedAllowanceState(ButtonStates.idle)
    }
  }

  React.useEffect(() => {
    Modal.setAppElement('#root')
  }, [])

  useEffect(() => {
    setInitiatedAllowanceState(ButtonStates.idle)
    setDisplayFundAmount(Zero)
    setAmountToDisplay(' ')

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, relay, exchangeType, currencySelected])

  const wallet = new BigNumber(currentToken ? currentToken : '0')

  const minDaiBridgeExchange = exchangeType === ExchangeType.deposit ? parseEther('5') : parseEther('10')
  const minOmniBridgeExchange = exchangeType === ExchangeType.deposit ? parseEther('1') : parseEther('1')
  const isDepositWithdrawDisabled =
    !wallet ||
    displayFundAmount.gt(wallet) ||
    displayFundAmount.isZero() ||
    displayFundAmount.lt(currencySelected === 'dai' ? minDaiBridgeExchange : minOmniBridgeExchange) ||
    (currentTokenMainnet &&
      currentTokenMainnet.allowance &&
      displayFundAmount.gt(new BigNumber(currentTokenMainnet.allowance))) ||
    (exchangeType === ExchangeType.withdraw && xDaiBalance?.isZero())

  const depositWithdraw = async () => {
    if (!cpk) {
      return
    }

    try {
      setMessage(`${exchangeType} ${formatBigNumber(displayFundAmount || new BigNumber(0), decimals)} ${symbol}`)
      setTxState(TransactionStep.waitingConfirmation)
      setConfirmations(9)
      setIsTransactionModalOpen(true)

      const hash =
        exchangeType === ExchangeType.deposit
          ? await cpk.sendMainnetTokenToBridge(displayFundAmount, address, symbol)
          : await cpk.sendXdaiChainTokenToBridge(
              displayFundAmount,
              address,
              {
                setTxState,
                setTxHash,
              },
              symbol,
            )

      const provider = exchangeType === ExchangeType.deposit ? context.rawWeb3Context.library : context.library

      setTxNetId(provider.network.chainId)
      setTxHash(hash)

      await waitForConfirmations(hash, provider, setConfirmations, setTxState)

      if (exchangeType === ExchangeType.deposit && symbol !== 'DAI') {
        await XdaiService.waitForBridgeMessageStatus(hash, context.library)
      }
      setTxState(TransactionStep.transactionConfirmed)
      await fetchBalances()

      onBack()
      setDisplayFundAmount(new BigNumber(0))
      setAmountToDisplay('')
    } catch (e) {
      setTxState(TransactionStep.error)
    }
  }

  const bridgeItems = bridgeTokensList.map((item, index) => {
    const { address, decimals, name, symbol } = getToken(networkIds.MAINNET, item)

    const token = findCurrentTokenBasedOnAction(exchangeType, symbol)

    return (
      <BalanceItem
        hover
        key={index}
        onClick={() => {
          setCurrencySelected(item)
        }}
      >
        <BalanceItemSide>
          <RadioInput checked={currencySelected === item} name={item} outcomeIndex={-1} readOnly />
          <Image size={'24'} src={getImageUrl(address)} style={{ marginLeft: '12px', marginRight: '12px' }} />
          <BalanceItemTitle notSelected={currencySelected !== item}>{name ? name : symbol}</BalanceItemTitle>
        </BalanceItemSide>
        <BalanceItemSide>
          <BalanceItemBalance>
            {token?.balance ? formatBigNumber(new BigNumber(token?.balance), decimals, 2) : '0.00'} {symbol}
          </BalanceItemBalance>
        </BalanceItemSide>
      </BalanceItem>
    )
  })

  return (
    <>
      <Modal
        isOpen={isOpen && !isTransactionModalOpen}
        onRequestClose={onClose}
        shouldCloseOnOverlayClick={true}
        style={{
          ...theme.fluidHeightModal,
          content: { ...theme.fluidHeightModal.content, height: '510px' },
        }}
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
              <BalanceItems>{bridgeItems}</BalanceItems>
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
              setDisplayFundAmount(wallet)
              setAmountToDisplay(formatBigNumber(wallet, STANDARD_DECIMALS, 5))
            }}
            shouldDisplayMaxButton={true}
            symbol={symbol}
          />
          {exchangeType === ExchangeType.withdraw && currencySelected !== 'dai' && xDaiBalance?.isZero() ? (
            <InputInfo>
              <IconAlertInverted />
              <div style={{ marginLeft: '12px' }}>Fund your Omen Account with Dai to proceed with the withdrawal.</div>
            </InputInfo>
          ) : (
            <>
              <ExchangeDataItem style={{ marginTop: '32px' }}>
                <span>Min amount</span>
                <span>
                  {currencySelected === 'dai'
                    ? `${formatBigNumber(minDaiBridgeExchange, STANDARD_DECIMALS, 2)} DAI`
                    : `${formatBigNumber(minOmniBridgeExchange, STANDARD_DECIMALS, 2)} ${symbol}`}
                </span>
              </ExchangeDataItem>
              <ExchangeDataItem style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex' }}>
                  {exchangeType === ExchangeType.withdraw ? 'Withdraw' : 'Deposit'} Fee
                  <div
                    data-arrow-color="transparent"
                    data-for="feeInfo"
                    data-tip={`Bridge Fee ${
                      currencySelected !== 'dai' && exchangeType === ExchangeType.withdraw ? '0.10%' : '0.00%'
                    }`}
                  >
                    <IconInfo hasCircle style={{ marginLeft: '8px' }} />
                  </div>
                </div>
                <ReactTooltip
                  className="customMarketTooltip"
                  data-multiline={true}
                  effect="solid"
                  id="feeInfo"
                  offset={{ top: -5, left: 0 }}
                  place="top"
                  type="light"
                />

                <span>
                  {exchangeType === ExchangeType.withdraw && currencySelected !== 'dai'
                    ? `${formatNumber(formatBigNumber(displayFundAmount.div(1000), decimals, 3), 2)} ${symbol}`
                    : `0.00 ${symbol}`}
                </span>
              </ExchangeDataItem>
              <Divider />
              <ExchangeDataItem>
                <span>Total</span>
                <span>
                  {currencySelected !== 'dai' && exchangeType === ExchangeType.withdraw
                    ? `${formatBigNumber(displayFundAmount.sub(displayFundAmount.div(1000)), decimals, 3)} ${symbol}`
                    : `${formatBigNumber(displayFundAmount, decimals, 2)} ${symbol}`}
                </span>
              </ExchangeDataItem>
            </>
          )}

          <BottomButtons>
            {isApprovalVisible && (
              <ApproveButton
                disabled={initiatedAllowanceState !== ButtonStates.idle}
                extraText
                onClick={approve}
                state={initiatedAllowanceState}
              >
                {initiatedAllowanceState === ButtonStates.idle && `Approve ${currencySelected.toUpperCase()}`}
                {initiatedAllowanceState === ButtonStates.working && 'Approving'}
                {initiatedAllowanceState === ButtonStates.finished && 'Approved'}
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
      </Modal>
      <ModalTransactionWrapper
        confirmations={confirmations}
        icon={
          <Image
            size={'24'}
            src={getImageUrl(
              currentTokenMainnet && currentTokenMainnet.address ? currentTokenMainnet.address : address,
            )}
            style={{ marginLeft: '10px' }}
          />
        }
        isOpen={isTransactionModalOpen}
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
