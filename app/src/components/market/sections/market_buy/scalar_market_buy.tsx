import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React, { useState } from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'

import { useCollateralBalance, useConnectedWeb3Context } from '../../../../hooks'
import { formatBigNumber, formatNumber } from '../../../../util/tools'
import { MarketMakerData, Token } from '../../../../util/types'
import { ButtonTab } from '../../../button'
import { BigNumberInput, TextfieldCustomPlaceholder } from '../../../common'
import { BigNumberInputReturn } from '../../../common/form/big_number_input'
import { CurrenciesWrapper, GenericError, TabsGrid } from '../../common/common_styled'
import { CurrencySelector } from '../../common/currency_selector'
import { GridTransactionDetails } from '../../common/grid_transaction_details'
import { MarketScale } from '../../common/market_scale'
import { TransactionDetailsCard } from '../../common/transaction_details_card'
import { TransactionDetailsLine } from '../../common/transaction_details_line'
import { TransactionDetailsRow } from '../../common/transaction_details_row'

interface Props extends RouteComponentProps<any> {
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: string) => void
}

enum Tabs {
  short,
  long,
}

const ScalarMarketBuyWrapper: React.FC<Props> = (props: Props) => {
  const { marketMakerData } = props
  const { fee, question } = marketMakerData

  const context = useConnectedWeb3Context()

  // TODO: Remove hardcoded values
  const lowerBound = new BigNumber('0')
  const currentPrediction = new BigNumber('720')
  const upperBound = new BigNumber('1000')
  const unit = 'USD'

  const [collateral, setCollateral] = useState<Token>(marketMakerData.collateral)
  const [amount, setAmount] = useState<BigNumber>(new BigNumber(0))
  const [amountToDisplay, setAmountToDisplay] = useState<string>('')

  const maybeCollateralBalance = useCollateralBalance(collateral, context)
  const collateralBalance = maybeCollateralBalance || Zero
  const currentBalance = `${formatBigNumber(collateralBalance, collateral.decimals, 5)}`

  const resolutionDate = question.resolution.getTime()
  const currentDate = new Date().getTime()
  const disableTrading = currentDate > resolutionDate

  const [activeTab, setActiveTab] = useState(Tabs.short)

  const amountError =
    maybeCollateralBalance === null
      ? null
      : maybeCollateralBalance.isZero() && amount.gt(maybeCollateralBalance)
      ? `Insufficient balance`
      : amount.gt(maybeCollateralBalance)
      ? `Value must be less than or equal to ${currentBalance} ${collateral.symbol}`
      : null

  const feePercentage = Number(formatBigNumber(fee, 18, 4)) * 100

  return (
    <>
      <MarketScale
        // TODO: Change to collateral.decimals
        decimals={0}
        lowerBound={lowerBound}
        startingPoint={currentPrediction}
        startingPointTitle={'Current prediction'}
        unit={unit}
        upperBound={upperBound}
      />
      <GridTransactionDetails>
        <div>
          <TabsGrid>
            <ButtonTab
              active={disableTrading ? false : activeTab === Tabs.short}
              disabled={disableTrading}
              onClick={() => setActiveTab(Tabs.short)}
            >
              Short
            </ButtonTab>
            <ButtonTab
              active={disableTrading ? false : activeTab === Tabs.long}
              onClick={() => setActiveTab(Tabs.long)}
            >
              Long
            </ButtonTab>
          </TabsGrid>
          <CurrenciesWrapper>
            <CurrencySelector
              balance={formatBigNumber(maybeCollateralBalance || Zero, collateral.decimals)}
              context={context}
              currency={collateral.address}
              disabled
              onSelect={(token: Token | null) => {
                if (token) {
                  setCollateral(token)
                  setAmount(new BigNumber(0))
                }
              }}
            />
          </CurrenciesWrapper>
          <ReactTooltip id="walletBalanceTooltip" />
          <TextfieldCustomPlaceholder
            formField={
              <BigNumberInput
                decimals={collateral.decimals}
                name="amount"
                onChange={(e: BigNumberInputReturn) => {
                  setAmount(e.value)
                  setAmountToDisplay('')
                }}
                style={{ width: 0 }}
                value={amount}
                valueToDisplay={amountToDisplay}
              />
            }
            onClickMaxButton={() => {
              setAmount(collateralBalance)
              setAmountToDisplay(formatNumber(formatBigNumber(collateralBalance, collateral.decimals), 5))
            }}
            shouldDisplayMaxButton
            symbol={collateral.symbol}
          />
          {amountError && <GenericError>{amountError}</GenericError>}
        </div>
        <div>
          <TransactionDetailsCard>
            <TransactionDetailsRow title={'Base Cost'} value={} />
            <TransactionDetailsRow
              title={'Fee'}
              tooltip={`A ${feePercentage}% fee goes to liquidity providers.`}
              value={}
            />
            <TransactionDetailsLine />
            <TransactionDetailsRow title={'Max. Loss'} value={} />
            <TransactionDetailsRow title={'Max. Profit'} value={} />
            <TransactionDetailsRow title={'Total'} value={} />
          </TransactionDetailsCard>
        </div>
      </GridTransactionDetails>
    </>
  )
}

export const ScalarMarketBuy = withRouter(ScalarMarketBuyWrapper)
