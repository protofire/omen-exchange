import { BigNumber, parseUnits } from 'ethers/utils'
import React from 'react'
import styled from 'styled-components'

import { useCompoundService, useConnectedWeb3Context, useSymbol } from '../../../../hooks'
import { getNativeAsset, getNativeCompoundAsset, getToken } from '../../../../util/networks'
import {
  formatBigNumber,
  formatNumber,
  getBaseTokenForCToken,
  isDust,
  roundNumberStringToSignificantDigits,
} from '../../../../util/tools'
import { BalanceItem, CompoundTokenType, PositionTableValue, Token } from '../../../../util/types'
import { TD, THead, TR, Table } from '../../../common'
import {
  OutcomeItemLittleBallOfJoyAndDifferentColors,
  OutcomeItemText,
  OutcomeItemTextWrapper,
  PaddingCSS,
  TDStyled,
  THStyled,
} from '../../common/common_styled'

const TableWrapper = styled.div`
  margin-left: -24px
  margin-right: -24px
`

const ColoredTDStyled = styled(TDStyled as any)<{ positive?: boolean | undefined }>`
  color: ${props =>
    props.positive ? props.theme.scale.positiveText : props.positive === false ? props.theme.scale.negativeText : ''};
`

const TDPosition = styled(TD as any)`
  ${PaddingCSS}
  font-weight: 400;
`

interface Props {
  balances: BalanceItem[]
  collateral: Token
  fee: BigNumber | null | undefined
  longPayout: number
  shortPayout: number
  longProfitLoss: number
  shortProfitLoss: number
  longProfitLossPercentage: number
  shortProfitLossPercentage: number
}

export const PositionTable = (props: Props) => {
  const {
    balances,
    collateral,
    longPayout,
    longProfitLoss,
    longProfitLossPercentage,
    shortPayout,
    shortProfitLoss,
    shortProfitLossPercentage,
  } = props

  let symbol = useSymbol(collateral)

  const context = useConnectedWeb3Context()
  const { networkId } = context

  const { compoundService: CompoundService } = useCompoundService(collateral ? collateral : null, context)
  const compoundService = CompoundService || null

  let baseCollateral = collateral
  if (collateral.symbol.toLowerCase() in CompoundTokenType) {
    const nativeCompoundAsset = getNativeCompoundAsset(networkId)
    if (collateral.symbol.toLowerCase() === nativeCompoundAsset.symbol.toLowerCase()) {
      baseCollateral = getNativeAsset(networkId)
    } else {
      const baseCollateralSymbol = getBaseTokenForCToken(collateral.symbol.toLowerCase()) as KnownToken
      baseCollateral = getToken(networkId, baseCollateralSymbol)
    }
    symbol = baseCollateral.symbol
  }

  let displayLongPayout = longPayout
  let displayShortPayout = shortPayout
  const shortShares = balances[0].shares
  const longShares = balances[1].shares
  let shortSharesFormatted = formatNumber(
    formatBigNumber(shortShares || new BigNumber(0), collateral.decimals, collateral.decimals),
  )
  let longSharesFormatted = formatNumber(
    formatBigNumber(longShares || new BigNumber(0), collateral.decimals, collateral.decimals),
  )
  let displayLongProfitLoss = longProfitLoss
  let displayShortProfitLoss = shortProfitLoss

  const getProfitLossInBase = (positionProfitLoss: number) => {
    if (compoundService) {
      const displayPositionProfitLossCollateralValue = roundNumberStringToSignificantDigits(
        Math.abs(positionProfitLoss).toString(),
        4,
      )
      const displayPositionProfitLossCollateralBNValue = parseUnits(
        displayPositionProfitLossCollateralValue,
        collateral.decimals,
      )
      const displayPositionProfitLossBaseCollateralBN = compoundService.calculateCTokenToBaseExchange(
        baseCollateral,
        displayPositionProfitLossCollateralBNValue,
      )
      const displayPositionProfitLossNum = formatBigNumber(
        displayPositionProfitLossBaseCollateralBN,
        baseCollateral.decimals,
        baseCollateral.decimals,
      )
      let displayPositionProfitLoss = parseFloat(displayPositionProfitLossNum)
      if (positionProfitLoss < 0) {
        displayPositionProfitLoss = -displayPositionProfitLoss
      }
      return displayPositionProfitLoss
    } else {
      return positionProfitLoss
    }
  }

  if (
    baseCollateral &&
    collateral &&
    baseCollateral.address !== collateral.address &&
    collateral.symbol.toLowerCase() in CompoundTokenType &&
    compoundService
  ) {
    if (longPayout && longPayout > 0) {
      const displayLongPayoutCollateralValue = roundNumberStringToSignificantDigits(Math.abs(longPayout).toString(), 4)
      const displayLongPayoutCollateralBNValue = parseUnits(displayLongPayoutCollateralValue, collateral.decimals)
      const displayLongPayoutCollateralBN = compoundService.calculateCTokenToBaseExchange(
        baseCollateral,
        displayLongPayoutCollateralBNValue,
      )
      const displayLongPayoutNum = formatBigNumber(displayLongPayoutCollateralBN, baseCollateral.decimals, 4)
      displayLongPayout = parseFloat(displayLongPayoutNum)
    }
    if (shortPayout && shortPayout > 0) {
      const displayShortPayoutCollateralValue = roundNumberStringToSignificantDigits(
        Math.abs(shortPayout).toString(),
        4,
      )
      const displayShortPayoutCollateralBNValue = parseUnits(displayShortPayoutCollateralValue, collateral.decimals)
      const displayShortPayoutCollateralBN = compoundService.calculateCTokenToBaseExchange(
        baseCollateral,
        displayShortPayoutCollateralBNValue,
      )
      const displayShortPayoutNum = formatBigNumber(displayShortPayoutCollateralBN, baseCollateral.decimals, 4)
      displayShortPayout = parseFloat(displayShortPayoutNum)
    }
    if (shortShares && shortShares.gt(0)) {
      const shortSharesBN = compoundService.calculateCTokenToBaseExchange(baseCollateral, shortShares)
      shortSharesFormatted = formatNumber(formatBigNumber(shortSharesBN || new BigNumber(0), baseCollateral.decimals))
    }
    if (longShares && longShares.gt(0)) {
      const longSharesBN = compoundService.calculateCTokenToBaseExchange(baseCollateral, longShares)
      longSharesFormatted = formatNumber(formatBigNumber(longSharesBN || new BigNumber(0), baseCollateral.decimals))
    }
    if (longProfitLoss) {
      displayLongProfitLoss = getProfitLossInBase(longProfitLoss)
    }
    if (shortProfitLoss) {
      displayShortProfitLoss = getProfitLossInBase(shortProfitLoss)
    }
  }

  const isShortPositive = shortProfitLoss > 0 ? true : shortProfitLoss < 0 ? false : undefined
  const isLongPositive = longProfitLoss > 0 ? true : longProfitLoss < 0 ? false : undefined

  const TableHead: PositionTableValue[] = [
    PositionTableValue.YourPosition,
    PositionTableValue.Shares,
    PositionTableValue.Payout,
    PositionTableValue.ProfitLoss,
  ]

  const TableCellsAlign = ['left', 'right', 'right', 'right']

  const renderTableHeader = () => {
    return (
      <THead>
        <TR>
          {TableHead.map((value, index) => {
            return (
              <THStyled key={index} textAlign={TableCellsAlign[index]}>
                {value} {value === PositionTableValue.Payout && `(${symbol})`}
              </THStyled>
            )
          })}
        </TR>
      </THead>
    )
  }

  const renderTableRow = (index: number) => {
    if (index === 0 && isDust(shortShares || new BigNumber(0), collateral.decimals)) return
    if (index === 1 && isDust(longShares || new BigNumber(0), collateral.decimals)) return
    return (
      <TR key={index}>
        <TDPosition textAlign={TableCellsAlign[0]}>
          <OutcomeItemTextWrapper>
            <OutcomeItemLittleBallOfJoyAndDifferentColors outcomeIndex={index} />
            <OutcomeItemText>{index === 0 ? 'Short' : 'Long'}</OutcomeItemText>
          </OutcomeItemTextWrapper>
        </TDPosition>
        <ColoredTDStyled textAlign={TableCellsAlign[1]}>
          {index === 0 ? shortSharesFormatted : longSharesFormatted}
        </ColoredTDStyled>
        <ColoredTDStyled positive={index === 0 ? isShortPositive : isLongPositive} textAlign={TableCellsAlign[2]}>
          {index === 0 ? formatNumber(displayShortPayout.toString()) : formatNumber(displayLongPayout.toString())}
        </ColoredTDStyled>
        <ColoredTDStyled positive={index === 0 ? isShortPositive : isLongPositive} textAlign={TableCellsAlign[3]}>
          {index === 0
            ? `${shortProfitLoss >= shortPayout ? '--' : formatNumber(displayShortProfitLoss.toString())} (${
                shortProfitLossPercentage === Infinity ? '--' : formatNumber(shortProfitLossPercentage.toString())
              }%)`
            : `${longProfitLoss >= longPayout ? '--' : formatNumber(displayLongProfitLoss.toString())} (${
                longProfitLossPercentage === Infinity ? '--' : formatNumber(longProfitLossPercentage.toString())
              }%)`}
        </ColoredTDStyled>
      </TR>
    )
  }

  const renderTable = () => {
    return [0, 1].map(index => renderTableRow(index))
  }

  return (
    <TableWrapper>
      <Table head={renderTableHeader()}>{renderTable()}</Table>
    </TableWrapper>
  )
}
