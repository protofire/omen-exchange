import { ethers } from 'ethers'
import { BigNumber } from 'ethers/utils'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { MARKET_FEE } from '../../common/constants'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { useAsyncDerivedValue } from '../../hooks/useAsyncDerivedValue'
import { useCollateralBalance } from '../../hooks/useCollateralBalance'
import { useContracts } from '../../hooks/useContracts'
import { CPKService, ERC20Service, MarketMakerService } from '../../services'
import { ButtonType } from '../../theme/component_styles/button_styling_types'
import { getLogger } from '../../util/logger'
import { computeBalanceAfterTrade, formatBigNumber } from '../../util/tools'
import { BalanceItem, OutcomeTableValue, Status, Token } from '../../util/types'
import {
  BigNumberInput,
  Button,
  ButtonContainer,
  DisplayArbitrator,
  GridTransactionDetails,
  GridTwoColumns,
  Loading,
  SectionTitle,
  SubsectionTitle,
  SubsectionTitleAction,
  SubsectionTitleWrapper,
  TextfieldCustomPlaceholder,
  TitleValue,
  ToggleTokenLock,
  TransactionDetailsCard,
  TransactionDetailsLine,
  TransactionDetailsRow,
  ViewCard,
  WalletBalance,
} from '../common'
import { BigNumberInputReturn } from '../common/big_number_input'
import { ButtonStates } from '../common/button_stateful'
import { OutcomeTable } from '../common/outcome_table'
import { SetAllowance } from '../common/set_allowance'
import { ValueStates } from '../common/transaction_details_row'
import { ModalTwitterShare } from '../modal/modal_twitter_share'

const LeftButton = styled(Button)`
  margin-right: auto;
`

const logger = getLogger('Market::Buy')

interface Props extends RouteComponentProps<any> {
  marketMakerAddress: string
  balances: BalanceItem[]
  collateral: Token
  question: string
  resolution: Maybe<Date>
}

const MarketBuyWrapper: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { library: provider } = context
  const { buildMarketMaker } = useContracts(context)
  const { balances, collateral, marketMakerAddress, question } = props
  const marketMaker = buildMarketMaker(marketMakerAddress)
  const [status, setStatus] = useState<Status>(Status.Ready)
  const [outcomeIndex, setOutcomeIndex] = useState<number>(0)
  const [cost, setCost] = useState<BigNumber>(new BigNumber(0))
  const [amount, setAmount] = useState<BigNumber>(new BigNumber(0))
  const [message, setMessage] = useState<string>('')
  const [isModalTwitterShareOpen, setModalTwitterShareState] = useState(false)
  const [messageTwitter, setMessageTwitter] = useState('')
  const [allowanceState, setAllowanceState] = useState<ButtonStates>(ButtonStates.idle)
  const [showingExtraInformation, setExtraInformation] = useState(false)

  const toggleExtraInformation = () =>
    showingExtraInformation ? setExtraInformation(false) : setExtraInformation(true)

  // get the amount of shares that will be traded and the estimated prices after trade
  const calcBuyAmount = useMemo(
    () => async (amount: BigNumber): Promise<[BigNumber, number[]]> => {
      const tradedShares = await marketMaker.calcBuyAmount(amount, outcomeIndex)
      const balanceAfterTrade = computeBalanceAfterTrade(
        balances.map(b => b.holdings),
        outcomeIndex,
        amount,
        tradedShares,
      )
      const pricesAfterTrade = MarketMakerService.getActualPrice(balanceAfterTrade)

      const probabilities = pricesAfterTrade.map(priceAfterTrade => priceAfterTrade * 100)

      return [tradedShares, probabilities]
    },
    [balances, marketMaker, outcomeIndex],
  )

  const [tradedShares, probabilities] = useAsyncDerivedValue(
    amount,
    [new BigNumber(0), balances.map(() => 0)],
    calcBuyAmount,
  )

  useEffect(() => {
    const valueNumber = +ethers.utils.formatUnits(amount, collateral.decimals)

    const weiPerUnit = ethers.utils.bigNumberify(10).pow(collateral.decimals)
    const marketFeeWithTwoDecimals = MARKET_FEE / Math.pow(10, 2)
    const costWithFee = ethers.utils
      .bigNumberify('' + Math.round(valueNumber * (1 + marketFeeWithTwoDecimals) * 10000)) // cast to string to avoid overflows
      .mul(weiPerUnit)
      .div(10000)
    setCost(costWithFee)
  }, [amount, collateral])

  const collateralBalance = useCollateralBalance(collateral, context)

  const finish = async () => {
    try {
      setStatus(Status.Loading)
      setMessage(`Buying ${formatBigNumber(tradedShares, collateral.decimals)} shares ...`)

      const signer = provider.getSigner()
      const account = await signer.getAddress()
      const cpk = await CPKService.create(provider)
      const collateralAddress = await marketMaker.getCollateralToken()
      const collateralService = new ERC20Service(provider, account, collateralAddress)
      const hasEnoughAlowance = await collateralService.hasEnoughAllowance(account, cpk.address, cost)

      if (!hasEnoughAlowance) {
        await collateralService.approveUnlimited(cpk.address)
      }

      await cpk.buyOutcomes({
        amount,
        outcomeIndex,
        marketMaker,
      })

      setMessageTwitter(
        `Your outcome was successfully created. You obtain ${formatBigNumber(
          tradedShares,
          collateral.decimals,
        )} shares.`,
      )
      setAmount(new BigNumber(0))
      setStatus(Status.Ready)

      setModalTwitterShareState(true)
    } catch (err) {
      setStatus(Status.Error)
      logger.log(`Error trying to buy: ${err.message}`)
    }
  }

  const isBuyAmountGreaterThanBalance = amount.gt(collateralBalance)

  const error =
    (status !== Status.Ready && status !== Status.Error) ||
    cost.isZero() ||
    isBuyAmountGreaterThanBalance ||
    amount.isZero()

  const noteAmount = `${formatBigNumber(collateralBalance, collateral.decimals)} ${collateral.symbol}`

  const amountFee = cost.sub(amount)

  const details = (showExtraDetails: boolean) => {
    const mockedDetails = [
      {
        title: 'Total Pool Tokens',
        value: '5000',
      },
      {
        title: 'Total Pool Earning',
        value: '25,232 DAI',
      },
      {
        title: 'My Pool Tokens',
        value: '0',
      },
      {
        title: 'My Earnings',
        value: '0 DAI',
      },

      {
        title: 'Category',
        value: 'Politics',
      },
      {
        title: 'Resolution Date',
        value: '25.09.19 - 09:00',
      },
      {
        title: 'Arbitrator/Oracle',
        value: (
          <DisplayArbitrator
            arbitrator={{ id: 'realitio', address: '0x1234567890', name: 'Realit.io', url: 'https://realit.io/' }}
          />
        ),
      },
      {
        title: '24h Volume',
        value: '425,523 DAI',
      },
    ]
    const mockedDetailsLastHalf = mockedDetails.splice(4, 8)

    return (
      <>
        <GridTwoColumns>
          {showExtraDetails ? (
            <>
              {mockedDetails.map((item, index) => (
                <TitleValue key={index} title={item.title} value={item.value} />
              ))}
            </>
          ) : null}
          {mockedDetailsLastHalf.map((item, index) => (
            <TitleValue key={index} title={item.title} value={item.value} />
          ))}
        </GridTwoColumns>
      </>
    )
  }

  const setAllowance = useCallback(() => {
    setAllowanceState(ButtonStates.working)
    setTimeout(() => {
      setAllowanceState(ButtonStates.finished)
    }, 3000)
  }, [])

  const mockedPotential = 1.03
  const fee = `${formatBigNumber(amountFee.mul(-1), collateral.decimals)} ${collateral.symbol}`
  const baseCost = `${formatBigNumber(amount.sub(amountFee), collateral.decimals)} ${collateral.symbol}`
  const potentialProfit = `${mockedPotential} ${collateral.symbol}`
  const sharesTotal = formatBigNumber(tradedShares, collateral.decimals)
  const total = `${sharesTotal} Shares`

  return (
    <>
      <SectionTitle goBackEnabled title={question} />
      <ViewCard>
        <SubsectionTitleWrapper>
          <SubsectionTitle>Purchase Outcome</SubsectionTitle>
          <SubsectionTitleAction onClick={toggleExtraInformation}>
            {showingExtraInformation ? 'Hide' : 'Show'} Pool Information
          </SubsectionTitleAction>
        </SubsectionTitleWrapper>
        {details(showingExtraInformation)}
        <OutcomeTable
          balances={balances}
          collateral={collateral}
          disabledColumns={[OutcomeTableValue.Payout]}
          outcomeHandleChange={(value: number) => setOutcomeIndex(value)}
          outcomeSelected={outcomeIndex}
          probabilities={probabilities}
        />
        <GridTransactionDetails>
          <div>
            <WalletBalance value={noteAmount} />
            <TextfieldCustomPlaceholder
              formField={
                <BigNumberInput
                  decimals={collateral.decimals}
                  name="amount"
                  onChange={(e: BigNumberInputReturn) => setAmount(e.value)}
                  value={amount}
                />
              }
              placeholderText={collateral.symbol}
            />
            <ToggleTokenLock amount={amount} collateral={collateral} context={context} />
          </div>
          <div>
            <TransactionDetailsCard>
              <TransactionDetailsRow title={'Fee'} value={fee} />
              <TransactionDetailsRow title={'Base Cost'} value={baseCost} />
              <TransactionDetailsLine />
              <TransactionDetailsRow
                emphasizeValue={mockedPotential > 0}
                state={ValueStates.success}
                title={'Potential Profit'}
                value={potentialProfit}
              />
              <TransactionDetailsRow emphasizeValue={parseFloat(sharesTotal) > 0} title={'Total'} value={total} />
            </TransactionDetailsCard>
          </div>
        </GridTransactionDetails>
        <SetAllowance onSetAllowance={setAllowance} state={allowanceState} />
        <ButtonContainer>
          <LeftButton
            buttonType={ButtonType.secondaryLine}
            onClick={() => props.history.push(`/${marketMakerAddress}`)}
          >
            Cancel
          </LeftButton>
          <Button buttonType={ButtonType.secondaryLine} disabled={error} onClick={() => finish()}>
            Buy
          </Button>
        </ButtonContainer>
      </ViewCard>
      <ModalTwitterShare
        description={messageTwitter}
        isOpen={isModalTwitterShareOpen}
        onClose={() => setModalTwitterShareState(false)}
        shareUrl={`${window.location.protocol}//${window.location.hostname}/#/${marketMakerAddress}`}
        title={'Outcome created'}
      />
      {status === Status.Loading ? <Loading full={true} message={message} /> : null}
    </>
  )
}

export const MarketBuy = withRouter(MarketBuyWrapper)
