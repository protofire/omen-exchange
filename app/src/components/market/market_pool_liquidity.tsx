import { BigNumber } from 'ethers/utils'
import React, { useMemo, useState } from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { useCollateralBalance } from '../../hooks/useCollateralBalance'
import { useContracts } from '../../hooks/useContracts'
import { useCpk } from '../../hooks/useCpk'
import { useCpkAllowance } from '../../hooks/useCpkAllowance'
import { useFundingBalance } from '../../hooks/useFundingBalance'
import { ERC20Service } from '../../services'
import { CPKService } from '../../services/cpk'
import { getLogger } from '../../util/logger'
import { formatBigNumber } from '../../util/tools'
import { BalanceItem, OutcomeTableValue, Status, Token } from '../../util/types'
import { Button, ButtonContainer, ButtonTab } from '../button'
import { ButtonType } from '../button/button_styling_types'
import {
  BigNumberInput,
  GridTransactionDetails,
  SectionTitle,
  TextfieldCustomPlaceholder,
  ViewCard,
  WalletBalance,
} from '../common'
import { BigNumberInputReturn } from '../common/big_number_input'
import { SetAllowance } from '../common/set_allowance'
import { FullLoading } from '../loading'

import { MarketTopDetails } from './market_top_details'
import { OutcomeTable } from './outcome_table'
import { TransactionDetailsCard } from './transaction_details_card'
import { TransactionDetailsLine } from './transaction_details_line'
import { TransactionDetailsRow, ValueStates } from './transaction_details_row'

interface Props extends RouteComponentProps<any> {
  marketMakerAddress: string
  question: string
  resolution: Maybe<Date>
  totalPoolShares: BigNumber
  userPoolShares: BigNumber
  marketMakerFunding: BigNumber
  marketMakerUserFunding: BigNumber
  balances: BalanceItem[]
  theme?: any
  collateral: Token
}

const LeftButton = styled(Button)`
  margin-right: auto;
`

const TabsGrid = styled.div`
  display: grid;
  grid-column-gap: 13px;
  grid-template-columns: 1fr 1fr;
  margin: 0 0 25px;
`

const logger = getLogger('Market::Fund')

const MarketPoolLiquidityWrapper: React.FC<Props> = (props: Props) => {
  const {
    balances,
    collateral,
    marketMakerAddress,
    // marketMakerFunding,
    // marketMakerUserFunding,
    question,
    // totalPoolShares,
    // userPoolShares,
  } = props

  enum Tabs {
    deposit,
    withdraw,
  }

  const context = useConnectedWeb3Context()
  const { account, library: provider } = context
  const cpk = useCpk()

  const { buildMarketMaker } = useContracts(context)
  const marketMaker = buildMarketMaker(marketMakerAddress)

  const signer = useMemo(() => provider.getSigner(), [provider])
  const [allowanceFinished, setAllowanceFinished] = useState(false)
  const { allowance, unlock } = useCpkAllowance(signer, collateral.address)

  const [amountToFund, setAmountToFund] = useState<BigNumber>(new BigNumber(0))
  const [amountToRemove, setAmountToRemove] = useState<BigNumber>(new BigNumber(0))
  const [status, setStatus] = useState<Status>(Status.Ready)
  const [message, setMessage] = useState<string>('')

  const [activeTab, setActiveTab] = useState(Tabs.deposit)

  // const marketMakerFundingPercentage: Maybe<number> = marketMakerFunding.isZero()
  //   ? null
  //   : 100 * divBN(marketMakerUserFunding, marketMakerFunding)
  // const userPoolSharesPercentage: Maybe<number> = totalPoolShares.isZero()
  //   ? null
  //   : 100 * divBN(userPoolShares, totalPoolShares)

  const addFunding = async () => {
    try {
      if (!account) {
        throw new Error('Please connect to your wallet to perform this action.')
      }

      setStatus(Status.Loading)
      setMessage(`Add funding amount: ${formatBigNumber(amountToFund, collateral.decimals)} ${collateral.symbol} ...`)

      const cpk = await CPKService.create(provider)

      const collateralAddress = await marketMaker.getCollateralToken()
      const collateralService = new ERC20Service(provider, account, collateralAddress)

      const hasEnoughAlowance = await collateralService.hasEnoughAllowance(account, cpk.address, amountToFund)

      if (!hasEnoughAlowance) {
        await collateralService.approveUnlimited(cpk.address)
      }

      await cpk.addFunding({
        amount: amountToFund,
        collateral,
        marketMaker,
      })

      setStatus(Status.Ready)
      setAmountToFund(new BigNumber(0))
    } catch (err) {
      setStatus(Status.Error)
      logger.log(`Error trying to add funding: ${err.message}`)
    }
  }

  const removeFunding = async () => {
    try {
      setStatus(Status.Loading)
      setMessage(`Remove funding amount: ${formatBigNumber(amountToRemove, collateral.decimals)} shares...`)

      const cpk = await CPKService.create(provider)

      await cpk.removeFunding({
        amount: amountToRemove,
        marketMaker,
      })

      setStatus(Status.Ready)
      setAmountToRemove(new BigNumber(0))
    } catch (err) {
      setStatus(Status.Error)
      logger.log(`Error trying to remove funding: ${err.message}`)
    }
  }

  const unlockCollateral = async () => {
    if (!cpk) {
      return
    }

    await unlock()

    setAllowanceFinished(true)
  }

  const collateralBalance = useCollateralBalance(collateral, context)

  const isFundingToAddGreaterThanBalance = amountToFund.gt(collateralBalance)
  const errorFundingToAdd = amountToFund.isZero() || isFundingToAddGreaterThanBalance

  const fundingBalance = useFundingBalance(marketMakerAddress, context)

  const isFundingToRemoveGreaterThanFundingBalance = amountToRemove.gt(fundingBalance)
  const errorFundingToRemove = amountToRemove.isZero() || isFundingToRemoveGreaterThanFundingBalance

  const probabilities = balances.map(balance => balance.probability)

  const hasZeroAllowance = allowance && allowance.isZero()
  const hasEnoughAllowance = allowance && allowance.gte(amountToFund)
  const showSetAllowance = allowanceFinished || hasZeroAllowance || !hasEnoughAllowance

  const mockedEarnTradingFee = 1.23
  const mockedEarned = 3.33
  const mockedPoolTokens = 1.12
  const mockedDeposited = 0.55
  const mockedTokenTotals = 11.55

  return (
    <>
      <SectionTitle goBackEnabled title={question} />
      <ViewCard>
        <MarketTopDetails
          marketMakerAddress={marketMakerAddress}
          title="Pool Liquidity"
          toggleTitleAction="Market Information"
        />
        <OutcomeTable
          balances={balances}
          collateral={collateral}
          disabledColumns={[OutcomeTableValue.Payout]}
          displayRadioSelection={false}
          probabilities={probabilities}
        />
        <GridTransactionDetails>
          <div>
            <TabsGrid>
              <ButtonTab active={activeTab === Tabs.deposit} onClick={() => setActiveTab(Tabs.deposit)}>
                Deposit
              </ButtonTab>
              <ButtonTab active={activeTab === Tabs.withdraw} onClick={() => setActiveTab(Tabs.withdraw)}>
                Withdraw
              </ButtonTab>
            </TabsGrid>
            {activeTab === Tabs.deposit && (
              <>
                <WalletBalance
                  value={`${formatBigNumber(collateralBalance, collateral.decimals)} ${collateral.symbol}`}
                />
                <TextfieldCustomPlaceholder
                  formField={
                    <BigNumberInput
                      decimals={collateral.decimals}
                      name="amountToFund"
                      onChange={(e: BigNumberInputReturn) => setAmountToFund(e.value)}
                      value={amountToFund}
                    />
                  }
                  placeholderText={collateral.symbol}
                />
              </>
            )}
            {activeTab === Tabs.withdraw && (
              <>
                <WalletBalance
                  text="My Pool Tokens"
                  value={`${formatBigNumber(collateralBalance, collateral.decimals)} ${collateral.symbol}`}
                />
                <TextfieldCustomPlaceholder
                  formField={
                    <BigNumberInput
                      decimals={collateral.decimals}
                      name="amountToRemove"
                      onChange={(e: BigNumberInputReturn) => setAmountToRemove(e.value)}
                      value={amountToRemove}
                    />
                  }
                  placeholderText={collateral.symbol}
                />
              </>
            )}
          </div>
          <div>
            {activeTab === Tabs.deposit && (
              <TransactionDetailsCard>
                <TransactionDetailsRow
                  emphasizeValue={mockedEarned > 0}
                  state={ValueStates.success}
                  title={'Earn Trading Fee'}
                  value={mockedEarned}
                />
                <TransactionDetailsLine />
                <TransactionDetailsRow
                  emphasizeValue={mockedPoolTokens > 0}
                  state={(mockedPoolTokens > 0 && ValueStates.important) || ValueStates.normal}
                  title={'Pool Tokens'}
                  value={`(2.22%) ${mockedPoolTokens ? mockedPoolTokens : '0.00'} ${collateral.symbol}`}
                />
              </TransactionDetailsCard>
            )}
            {activeTab === Tabs.withdraw && (
              <TransactionDetailsCard>
                <TransactionDetailsRow
                  emphasizeValue={mockedEarnTradingFee > 0}
                  state={ValueStates.success}
                  title={'Earned'}
                  value={mockedEarnTradingFee}
                />
                <TransactionDetailsRow state={ValueStates.success} title={'Deposited'} value={mockedDeposited} />
                <TransactionDetailsLine />
                <TransactionDetailsRow
                  emphasizeValue={mockedTokenTotals > 0}
                  state={(mockedTokenTotals > 0 && ValueStates.important) || ValueStates.normal}
                  title={'Total'}
                  value={`${mockedTokenTotals ? mockedTokenTotals : '0.00'} ${collateral.symbol}`}
                />
              </TransactionDetailsCard>
            )}
          </div>
        </GridTransactionDetails>
        {activeTab === Tabs.deposit && showSetAllowance && (
          <SetAllowance
            collateral={collateral}
            finished={allowanceFinished}
            loading={allowance === null}
            onUnlock={unlockCollateral}
          />
        )}
        <ButtonContainer>
          <LeftButton
            buttonType={ButtonType.secondaryLine}
            onClick={() => props.history.push(`/${marketMakerAddress}`)}
          >
            Cancel
          </LeftButton>
          {activeTab === Tabs.deposit && (
            <Button
              buttonType={ButtonType.secondaryLine}
              disabled={errorFundingToAdd || hasZeroAllowance || !hasEnoughAllowance}
              onClick={() => addFunding()}
            >
              Deposit
            </Button>
          )}
          {activeTab === Tabs.withdraw && (
            <Button
              buttonType={ButtonType.secondaryLine}
              disabled={errorFundingToRemove}
              onClick={() => removeFunding()}
            >
              Withdraw
            </Button>
          )}
        </ButtonContainer>
      </ViewCard>
      {status === Status.Loading && <FullLoading message={message} />}
    </>
  )
}

export const MarketPoolLiquidity = withRouter(MarketPoolLiquidityWrapper)
