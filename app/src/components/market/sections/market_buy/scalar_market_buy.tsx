import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React from 'react'
import styled from 'styled-components'

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

interface Props {
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: string) => void
}

export const ScalarMarketBuy = (props: Props) => {
  const { marketMakerData, switchMarketTab } = props

  const { outcomeTokenMarginalPrices, question, scalarHigh, scalarLow } = marketMakerData

  return (
    <>
      <MarketScale
        currentPrediction={outcomeTokenMarginalPrices[1]}
        lowerBound={scalarLow || new BigNumber(0)}
        startingPointTitle={'Current prediction'}
        unit={question.title ? question.title.split('[')[1].split(']')[0] : ''}
        upperBound={scalarHigh || new BigNumber(0)}
      />
      <GridTransactionDetails>
        <div>
          <TabsGrid>
            <ButtonTab>Short</ButtonTab>
            <ButtonTab>Long</ButtonTab>
          </TabsGrid>
        </div>
      </GridTransactionDetails>
      <StyledButtonContainer>
        <MarketBottomNavButton buttonType={ButtonType.secondaryLine} onClick={() => switchMarketTab('SWAP')}>
          Cancel
        </MarketBottomNavButton>
        {/* TODO: Add isBuyDisabled and onClick handler */}
        <MarketBottomNavButton buttonType={ButtonType.secondaryLine}>Buy Position</MarketBottomNavButton>
      </StyledButtonContainer>
    </>
  )
}
