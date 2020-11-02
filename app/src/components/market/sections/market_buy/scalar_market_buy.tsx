import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React from 'react'

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
  return <p>scalar buy</p>
}
