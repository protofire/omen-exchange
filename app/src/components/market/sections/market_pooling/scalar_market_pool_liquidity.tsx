import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React, { useState } from 'react'
import { RouteComponentProps, useHistory, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { useCollateralBalance, useConnectedWeb3Context, useFundingBalance } from '../../../../hooks'
import { formatBigNumber, formatNumber } from '../../../../util/tools'
import { MarketMakerData, Token } from '../../../../util/types'
import { Button, ButtonContainer, ButtonTab } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import { BigNumberInput, TextfieldCustomPlaceholder, TitleValue } from '../../../common'
import { BigNumberInputReturn } from '../../../common/form/big_number_input'
import { CurrenciesWrapper, GenericError, TabsGrid } from '../../common/common_styled'
import { CurrencySelector } from '../../common/currency_selector'
import { GridTransactionDetails } from '../../common/grid_transaction_details'
import { TokenBalance } from '../../common/token_balance'
import { TransactionDetailsCard } from '../../common/transaction_details_card'
import { TransactionDetailsLine } from '../../common/transaction_details_line'
import { TransactionDetailsRow, ValueStates } from '../../common/transaction_details_row'

const BottomButtonWrapper = styled(ButtonContainer)`
  justify-content: space-between;
  border-top: ${({ theme }) => theme.borders.borderLineDisabled};
  margin: 0 -24px;
  padding: 20px 24px 0;
`

enum Tabs {
  deposit,
  withdraw,
}

interface Props {
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: string) => void
  fetchGraphMarketMakerData: () => Promise<void>
}

export const ScalarMarketPoolLiquidity = (props: Props) => {
  const { fetchGraphMarketMakerData, marketMakerData } = props
  const { address: marketMakerAddress, balances, fee, totalEarnings, totalPoolShares, userEarnings } = marketMakerData
  const context = useConnectedWeb3Context()
  const history = useHistory()

  const resolutionDate = marketMakerData.question.resolution.getTime()
  const currentDate = new Date().getTime()
  const disableDepositTab = currentDate > resolutionDate

  const [activeTab, setActiveTab] = useState(disableDepositTab ? Tabs.withdraw : Tabs.deposit)
  const [collateral, setCollateral] = useState<Token>(marketMakerData.collateral)
  const [amountToFund, setAmountToFund] = useState<Maybe<BigNumber>>(new BigNumber(0))
  const [amountToFundDisplay, setAmountToFundDisplay] = useState<string>('')
  const [amountToRemove, setAmountToRemove] = useState<Maybe<BigNumber>>(new BigNumber(0))
  const [amountToRemoveDisplay, setAmountToRemoveDisplay] = useState<string>('')

  const { collateralBalance: maybeCollateralBalance, fetchCollateralBalance } = useCollateralBalance(
    collateral,
    context,
  )
  const collateralBalance = maybeCollateralBalance || Zero
  const { fetchFundingBalance, fundingBalance: maybeFundingBalance } = useFundingBalance(marketMakerAddress, context)
  const fundingBalance = maybeFundingBalance || Zero

  const walletBalance = formatNumber(formatBigNumber(collateralBalance, collateral.decimals, 5), 5)
  const sharesBalance = formatBigNumber(fundingBalance, collateral.decimals)

  return (
    <>
      <GridTransactionDetails>
        <div>
          <TabsGrid>
            <ButtonTab
              active={disableDepositTab ? false : activeTab === Tabs.deposit}
              disabled={disableDepositTab}
              onClick={() => setActiveTab(Tabs.deposit)}
            >
              Deposit
            </ButtonTab>
            <ButtonTab
              active={disableDepositTab ? true : activeTab === Tabs.withdraw}
              onClick={() => setActiveTab(Tabs.withdraw)}
            >
              Withdraw
            </ButtonTab>
          </TabsGrid>
          {activeTab === Tabs.deposit && (
            <>
              <CurrenciesWrapper>
                <CurrencySelector
                  balance={walletBalance}
                  context={context}
                  currency={collateral.address}
                  disabled
                  onSelect={(token: Token | null) => {
                    if (token) {
                      setCollateral(token)
                      setAmountToFund(new BigNumber(0))
                    }
                  }}
                />
              </CurrenciesWrapper>

              <TextfieldCustomPlaceholder
                formField={
                  <BigNumberInput
                    decimals={collateral.decimals}
                    name="amountToFund"
                    onChange={(e: BigNumberInputReturn) => {
                      setAmountToFund(e.value)
                      setAmountToFundDisplay('')
                    }}
                    style={{ width: 0 }}
                    value={amountToFund}
                    valueToDisplay={amountToFundDisplay}
                  />
                }
                onClickMaxButton={() => {
                  setAmountToFund(collateralBalance)
                  setAmountToFundDisplay(formatBigNumber(collateralBalance, collateral.decimals, 5))
                }}
                shouldDisplayMaxButton
                symbol={collateral.symbol}
              />
            </>
          )}
          {activeTab === Tabs.withdraw && (
            <>
              <TokenBalance text="Pool Tokens" value={formatNumber(sharesBalance)} />

              <TextfieldCustomPlaceholder
                formField={
                  <BigNumberInput
                    decimals={collateral.decimals}
                    name="amountToRemove"
                    onChange={(e: BigNumberInputReturn) => {
                      setAmountToRemove(e.value)
                      setAmountToRemoveDisplay('')
                    }}
                    style={{ width: 0 }}
                    value={amountToRemove}
                    valueToDisplay={amountToRemoveDisplay}
                  />
                }
                onClickMaxButton={() => {
                  setAmountToRemove(fundingBalance)
                  setAmountToRemoveDisplay(formatBigNumber(fundingBalance, collateral.decimals, 5))
                }}
                shouldDisplayMaxButton
                symbol="Shares"
              />
            </>
          )}
        </div>
      </GridTransactionDetails>
      <BottomButtonWrapper>
        <Button buttonType={ButtonType.secondaryLine} onClick={() => history.goBack()}>
          Cancel
        </Button>
        {activeTab === Tabs.deposit && <Button buttonType={ButtonType.primaryAlternative}>Deposit</Button>}
        {activeTab === Tabs.withdraw && <Button buttonType={ButtonType.primaryAlternative}>Withdraw</Button>}
      </BottomButtonWrapper>
    </>
  )
}
