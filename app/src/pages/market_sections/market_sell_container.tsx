import { BigNumber } from 'ethers/utils'
import React, { useState } from 'react'

import { MarketSell } from '../../components/market/sections/market_sell/market_sell'
import { ScalarMarketSell } from '../../components/market/sections/market_sell/scalar_market_sell'
import { useConnectedWeb3Context } from '../../hooks'
import { formatBigNumber, formatNumber, getInitialCollateral } from '../../util/tools'
import { BalanceItem, MarketDetailsTab, MarketMakerData, Status, Token } from '../../util/types'

interface Props {
  currentTab: MarketDetailsTab
  isScalar: boolean
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: MarketDetailsTab) => void
  fetchGraphMarketMakerData: () => Promise<void>
  fetchGraphMarketUserTxData: () => Promise<void>
}
export type SharedPropsInterface = {
  isSellButtonDisabled: boolean
}
const MarketSellContainer: React.FC<Props> = (props: Props) => {
  const { isScalar } = props
  const context = useConnectedWeb3Context()

  const [amountShares, setAmountShares] = useState<Maybe<BigNumber>>(new BigNumber(0))
  const [positionIndex, setPositionIndex] = useState(
    props.marketMakerData.balances[0].shares.gte(props.marketMakerData.balances[1].shares) ? 0 : 1,
  )
  const [isNegativeAmountShares, setIsNegativeAmountShares] = useState<boolean>(false)
  const initialCollateral = getInitialCollateral(context.networkId, props.marketMakerData.collateral)
  const [collateral, setCollateral] = useState<Token>(initialCollateral)
  const [balanceItem, setBalanceItem] = useState<BalanceItem>(props.marketMakerData.balances[positionIndex])
  const selectedOutcomeBalance = formatNumber(
    formatBigNumber(balanceItem.shares, collateral.decimals, collateral.decimals),
  )
  const amountError =
    balanceItem.shares === null
      ? null
      : balanceItem.shares.isZero() && amountShares?.gt(balanceItem.shares)
      ? `Insufficient balance`
      : amountShares?.gt(balanceItem.shares)
      ? `Value must be less than or equal to ${selectedOutcomeBalance} shares`
      : null
  const isSellButtonDisabled =
    !amountShares ||
    (status !== Status.Ready && status !== Status.Error) ||
    amountShares?.isZero() ||
    amountError !== null ||
    isNegativeAmountShares

  const sharedObject = { isSellButtonDisabled }

  return (
    <>
      {isScalar ? (
        <ScalarMarketSell sharedProps={sharedObject} {...props} />
      ) : (
        <MarketSell sharedProps={sharedObject} {...props} />
      )}
    </>
  )
}

export { MarketSellContainer }
