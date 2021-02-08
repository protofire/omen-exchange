import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React, { useEffect, useRef, useState } from 'react'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'

import { formatBigNumber, formatNumber, isDust } from '../../../../util/tools'
import {
  BalanceItem,
  LiquidityObject,
  LiquidityType,
  Status,
  Token,
  TradeObject,
  TradeType,
} from '../../../../util/types'
import { IconInfo } from '../../../common/tooltip/img/IconInfo'
import { Circle } from '../../common/common_styled'
import { PositionTable } from '../position_table'

const SCALE_HEIGHT = '20px'
const BAR_WIDTH = '2px'
const BALL_SIZE = '20px'
const DOT_SIZE = '8px'
const VALUE_BOXES_MARGIN = '12px'

const ScaleWrapper = styled.div<{
  borderBottom: boolean | undefined
  borderTop: boolean | undefined
  valueBoxes: boolean | undefined
}>`
  display: flex;
  flex-direction: column;
  height: 174px;
  border-bottom: ${props => (!props.borderBottom ? 'none' : `1px solid ${props.theme.scale.bar}`)};
  margin-left: -25px;
  margin-right: -25px;
  padding-left: 25px;
  padding-right: 25px;
  position: relative;
  ${props => props.borderTop && `border-top: 1px solid ${props.theme.scale.border}; padding-top: 24px; height: 202px;`};

  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    ${props => props.valueBoxes && 'padding-bottom: 24px; height: 278px;'}
  }
`

const ScaleTitleWrapper = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  margin-top: 5px;
  margin-bottom: 18px;
`

const ScaleTitle = styled.p`
  font-size: 14px;
  color: ${props => props.theme.colors.textColor};
  margin: 0;
`

const Scale = styled.div`
  position: relative;
  height: ${SCALE_HEIGHT};
  width: 100%;
`

const VerticalBar = styled.div<{ position: number; positive: Maybe<boolean> }>`
  position: absolute;
  top: 0;
  bottom: 0;
  width: ${BAR_WIDTH};
  height: ${SCALE_HEIGHT};

  ${props => (props.position === 0 ? 'left: 0;' : props.position === 1 ? 'left: calc(50% - 1px);' : 'right: 0;')}
  background: ${props =>
    props.positive
      ? `${props.theme.scale.positive}`
      : props.positive === null
      ? `${props.theme.scale.bar}`
      : `${props.theme.scale.negative}`};
`

const HorizontalBar = styled.div`
  position: absolute;
  top: calc(50% - ${BAR_WIDTH} / 2);
  left: 0;
  right: 0;
  width: 100%
  height: ${BAR_WIDTH};
  background: ${props => props.theme.scale.bar};
`

const HorizontalBarLeft = styled.div<{ positive: boolean | null; width: number }>`
  position: absolute;
  top: calc(50% - ${BAR_WIDTH} / 2);
  left: 0;
  width: ${props => props.width * 100}%;
  background: ${props => (props.positive ? `${props.theme.scale.positive}` : `${props.theme.scale.negative}`)};
  height: ${BAR_WIDTH};
  z-index: 2;
`

const HorizontalBarRight = styled.div<{ positive: boolean | null; width: number }>`
  position: absolute;
  top: calc(50% - ${BAR_WIDTH} / 2);
  right: 0;
  width: ${props => props.width * 100}%;
  background: ${props => (props.positive ? `${props.theme.scale.positive}` : `${props.theme.scale.negative}`)};
  height: ${BAR_WIDTH};
  z-index: 2;
`

const HorizontalBarChange = styled.div<{ start: number; width: number }>`
  position: absolute;
  top: calc(50% - ${BAR_WIDTH} / 2);
  left: ${props => props.start * 100}%;
  width: ${props => props.width * 100}%;
  background: ${props => props.theme.scale.neutral};
  height: ${BAR_WIDTH};
  z-index: 2;
`

const ScaleBallContainer = styled.div`
  width: 100%;
`

const ScaleBall = styled.input`
  height: ${SCALE_HEIGHT};
  width: calc(100% + ${BALL_SIZE});
  background: none;
  outline: none;
  -webkit-appearance: none;
  z-index: 4;
  position: absolute;
  left: calc(-${BALL_SIZE} / 2);
  right: calc(-${BALL_SIZE} / 2);

  &::-webkit-slider-thumb {
    appearance: none;
    height: ${BALL_SIZE};
    width: ${BALL_SIZE};
    border-radius: 50%;
    border: 3px solid ${props => props.theme.scale.ballBorder};
    background: ${props => props.theme.scale.ballBackground};
    cursor: pointer;
  }

  &::-moz-range-thumb {
    height: ${BALL_SIZE};
    width: ${BALL_SIZE};
    border-radius: 50%;
    border: 3px solid ${props => props.theme.scale.ballBorder};
    background: ${props => props.theme.scale.ballBackground};
    cursor: pointer;
  }
`

const ScaleDot = styled.div<{ xValue: number; positive?: Maybe<boolean> }>`
  position: absolute;
  height: ${DOT_SIZE};
  width: ${DOT_SIZE};
  background: ${props =>
    props.positive
      ? `${props.theme.scale.positive}`
      : props.positive === false
      ? `${props.theme.scale.negative}`
      : `${props.theme.scale.neutral}`};
  border-radius: 50%;
  z-index: 3;
  left: ${props => props.xValue * 100}%;
  transform: translateX(-50%);
  margin-top: calc((${SCALE_HEIGHT} - ${DOT_SIZE}) / 2);
`

const ScaleTooltip = styled.div<{ xValue: number }>`
  position: absolute;
  padding: 5px 8px;
  top: -42px;
  left: ${({ xValue }) => xValue}%;
  transform: translateX(-50%);
  background-color: ${({ theme }) => theme.colors.mainBodyBackground};
  border-radius: ${({ theme }) => theme.borders.commonBorderRadius};
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid ${({ theme }) => theme.borders.tooltip};
  white-space: nowrap;
  opacity: 0;
  transition: 0.2s opacity;
`

const ScaleTooltipMessage = styled.p`
  font-size: ${({ theme }) => theme.fonts.defaultSize};
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0.1px;
  text-align: left;
  margin: 0;
`

const ValueBoxes = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${VALUE_BOXES_MARGIN};
  width: 100%;

  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    flex-direction: column;
    justify-content: center;
  }
`

const ValueBoxPair = styled.div`
  width: calc(50% - ${VALUE_BOXES_MARGIN} / 2);
  display: flex;
  align-items: center;

  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    width: calc(100% - ${VALUE_BOXES_MARGIN} / 2);

    &:nth-of-type(2) {
      margin-top: 12px;
    }
  }
`

const ValueBox = styled.div<{ xValue?: number }>`
  padding: 12px;
  border: 1px solid ${props => props.theme.scale.box};
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 50%;
  background: white;

  &:nth-of-type(odd) {
    border-top-right-radius: 0px;
    border-bottom-right-radius: 0px;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }
  &:nth-of-type(even) {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
    border-left: none;
  }
`

const ValueBoxRegular = styled.div<{ xValue?: number }>`
  padding: 12px;
  border: 1px solid ${props => props.theme.scale.box};
  display: flex;
  flex-direction: column;
  align-items: center;
  ${props =>
    props.xValue
      ? props.xValue <= 0.885
        ? `left: ${
            props.xValue <= 0.115
              ? `0`
              : props.xValue <= 0.885
              ? `${props.xValue * 100}%; transform: translateX(-50%);`
              : ``
          }`
        : `right: 0;`
      : ''}
  background: white;
  position: absolute;
  top: calc(${SCALE_HEIGHT} + ${VALUE_BOXES_MARGIN});
  border-radius: 4px;
`

const ValueBoxTitle = styled.p<{ positive?: boolean | undefined }>`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.colors.textColorDarker};
  margin-bottom: 2px;
  margin-top: 0;
  color: ${props =>
    props.positive ? props.theme.scale.positiveText : props.positive === false ? props.theme.scale.negativeText : ''};
`

const ValueBoxSubtitle = styled.p`
  font-size: 14px;
  color: ${props => props.theme.colors.textColor};
  margin: 0;
  white-space: nowrap;
  display: flex;
  align-items: center;
`

interface Props {
  amountShares?: Maybe<BigNumber>
  lowerBound: BigNumber
  startingPoint?: Maybe<BigNumber>
  unit: string
  upperBound: BigNumber
  startingPointTitle: string
  currentPrediction?: Maybe<string>
  borderTop?: boolean
  newPrediction?: Maybe<number>
  long?: Maybe<boolean>
  short?: Maybe<boolean>
  collateral?: Maybe<Token>
  amount?: Maybe<BigNumber>
  positionTable?: Maybe<boolean>
  trades?: Maybe<TradeObject[]>
  liquidityTxs?: Maybe<LiquidityObject[]>
  status?: Maybe<Status>
  balances?: Maybe<BalanceItem[]>
  fee?: Maybe<BigNumber>
}

export const MarketScale: React.FC<Props> = (props: Props) => {
  const {
    amount,
    amountShares,
    balances,
    borderTop,
    collateral,
    currentPrediction,
    fee,
    liquidityTxs,
    long,
    lowerBound,
    newPrediction,
    positionTable,
    short,
    startingPoint,
    startingPointTitle,
    status,
    trades,
    unit,
    upperBound,
  } = props

  const lowerBoundNumber = lowerBound && Number(formatBigNumber(lowerBound, 18))
  const upperBoundNumber = upperBound && Number(formatBigNumber(upperBound, 18))
  const startingPointNumber = startingPoint && Number(formatBigNumber(startingPoint || new BigNumber(0), 18))

  const currentPredictionNumber = Number(currentPrediction) * (upperBoundNumber - lowerBoundNumber) + lowerBoundNumber
  const newPredictionNumber = Number(newPrediction) * (upperBoundNumber - lowerBoundNumber) + lowerBoundNumber

  const amountSharesNumber =
    collateral && Number(formatBigNumber(amountShares || new BigNumber(0), collateral.decimals))

  const amountNumber = collateral && Number(formatBigNumber(amount || new BigNumber(0), collateral.decimals))
  const feeNumber = fee && collateral && Number(formatBigNumber(fee, collateral.decimals))

  const shortBalances = balances && balances.filter(balance => balance.outcomeName === 'short')
  const shortShares =
    shortBalances &&
    shortBalances.length &&
    shortBalances.map(shortBalance => shortBalance.shares).reduce((a, b) => a.add(b))

  const longBalances = balances && balances.filter(balance => balance.outcomeName === 'long')
  const longShares =
    longBalances &&
    longBalances.length &&
    longBalances.map(longBalance => longBalance.shares).reduce((a, b) => a.add(b))

  const shortSharesNumber = collateral && Number(formatBigNumber(shortShares || new BigNumber(0), collateral.decimals))
  const longSharesNumber = collateral && Number(formatBigNumber(longShares || new BigNumber(0), collateral.decimals))

  const [isAmountInputted, setIsAmountInputted] = useState(false)

  const initialMount = useRef(true)
  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false
      return
    }
    setIsAmountInputted(newPrediction ? newPrediction !== Number(currentPrediction) : false)
  }, [newPrediction, currentPrediction])

  const [scaleValue, setScaleValue] = useState<number>(
    newPrediction
      ? newPrediction * 100
      : currentPrediction
      ? Number(currentPrediction) * 100
      : ((startingPointNumber || 0 - lowerBoundNumber) / (upperBoundNumber - lowerBoundNumber)) * 100,
  )
  const [scaleValuePrediction, setScaleValuePrediction] = useState(currentPredictionNumber || newPredictionNumber)
  const [yourPayout, setYourPayout] = useState(0)
  const [profitLoss, setProfitLoss] = useState(0)
  const [shortPayout, setShortPayout] = useState(0)
  const [longPayout, setLongPayout] = useState(0)
  const [totalShortPrice, setTotalShortPrice] = useState<BigNumber>(new BigNumber(0))
  const [totalLongPrice, setTotalLongPrice] = useState<BigNumber>(new BigNumber(0))
  const [shortProfitAmount, setShortProfitAmount] = useState(0)
  const [longProfitAmount, setLongProfitAmount] = useState(0)
  const [longProfitPercentage, setLongProfitPercentage] = useState(0)
  const [shortProfitPercentage, setShortProfitPercentage] = useState(0)

  useEffect(() => {
    let totalShortTradesCost = new BigNumber(0)
    let totalLongTradesCost = new BigNumber(0)
    if (trades && trades.length && collateral) {
      const shortTrades = trades.filter(trade => trade.outcomeIndex === '0')
      totalShortTradesCost = shortTrades.length
        ? shortTrades
            .map(trade => (trade.type === TradeType.buy ? trade.collateralAmount : Zero.sub(trade.collateralAmount)))
            .reduce((a, b) => a.add(b))
        : new BigNumber(0)

      const longTrades = trades.filter(trade => trade.outcomeIndex === '1')
      totalLongTradesCost = longTrades.length
        ? longTrades
            .map(trade => (trade.type === TradeType.buy ? trade.collateralAmount : Zero.sub(trade.collateralAmount)))
            .reduce((a, b) => a.add(b))
        : new BigNumber(0)
    }

    let totalShortLiquidityTxsCost = new BigNumber(0)
    let totalLongLiquidityTxsCost = new BigNumber(0)
    if (liquidityTxs && liquidityTxs.length) {
      const addLiquidityTxs = liquidityTxs.filter(tx => tx.type === LiquidityType.add)
      const removeLiquidityTxs = liquidityTxs.filter(tx => tx.type === LiquidityType.remove)

      // More short shares provided so short shares are purchased
      const addLiquidityShortPurchaseTxs = addLiquidityTxs.filter(tx =>
        tx.outcomeTokenAmounts[0].lt(tx.outcomeTokenAmounts[1]),
      )
      // More long shares are removed so short shares are purchased
      const shortAdditionalSharesCosts = addLiquidityShortPurchaseTxs
        .concat(removeLiquidityTxs.filter(tx => tx.outcomeTokenAmounts[0].gt(tx.outcomeTokenAmounts[1])))
        .map(tx => tx.additionalSharesCost)

      if (shortAdditionalSharesCosts.length) {
        totalShortLiquidityTxsCost = shortAdditionalSharesCosts.reduce((a, b) => a.add(b))
      }

      // More long shares provided so long shares are purchased
      const addLiquidityLongPurchaseTxs = addLiquidityTxs.filter(tx =>
        tx.outcomeTokenAmounts[0].gt(tx.outcomeTokenAmounts[1]),
      )
      // More short shares are removed so long shares are purchased
      const longAdditionalSharesCosts = addLiquidityLongPurchaseTxs
        .concat(removeLiquidityTxs.filter(tx => tx.outcomeTokenAmounts[0].lt(tx.outcomeTokenAmounts[1])))
        .map(tx => tx.additionalSharesCost)

      if (longAdditionalSharesCosts.length) {
        totalLongLiquidityTxsCost = longAdditionalSharesCosts.reduce((a, b) => a.add(b))
      }
    }

    setTotalShortPrice(totalShortTradesCost.add(totalShortLiquidityTxsCost))
    setTotalLongPrice(totalLongTradesCost.add(totalLongLiquidityTxsCost))
  }, [trades, collateral, liquidityTxs])

  const scaleBall: Maybe<HTMLInputElement> = document.querySelector('.scale-ball')
  const handleScaleBallChange = () => {
    setScaleValue(Number(scaleBall?.value))
    setScaleValuePrediction((Number(scaleBall?.value) / 100) * (upperBoundNumber - lowerBoundNumber) + lowerBoundNumber)
  }

  useEffect(() => {
    setScaleValue(
      newPrediction
        ? newPrediction * 100
        : currentPrediction
        ? Number(currentPrediction) * 100
        : (((startingPointNumber || 0) - lowerBoundNumber) / (upperBoundNumber - lowerBoundNumber)) * 100,
    )
    setScaleValuePrediction(Number(newPrediction) * (upperBoundNumber - lowerBoundNumber) + lowerBoundNumber)
  }, [newPrediction, currentPrediction, lowerBoundNumber, startingPointNumber, upperBoundNumber])

  useEffect(() => {
    if (long) {
      // Calculate total payout by mulitplying shares amount by scale position
      setYourPayout((amountSharesNumber || 0) * (scaleValue / 100))
      // Calculate profit by subtracting amount paid from payout
      setProfitLoss((amountSharesNumber || 0) * (scaleValue / 100) - (amountNumber || 0))
    } else if (short) {
      // Calculate total payout by mulitplying shares amount by scale position
      setYourPayout((amountSharesNumber || 0) * (1 - scaleValue / 100))
      // Calculate profit by subtracting amount paid from payout
      setProfitLoss((amountSharesNumber || 0) * (1 - scaleValue / 100) - (amountNumber || 0))
    } else {
      if (shortShares && collateral && !isDust(shortShares, collateral.decimals)) {
        const totalShortPriceNumber = Number(formatBigNumber(totalShortPrice, collateral.decimals, collateral.decimals))
        const shortPayoutAmount = (shortSharesNumber || 0) * (1 - scaleValue / 100)
        const shortProfit = shortPayoutAmount - totalShortPriceNumber
        const shortProfitRatio = shortPayoutAmount / totalShortPriceNumber - 1
        setShortPayout(shortPayoutAmount)
        setShortProfitAmount(shortProfit)
        setShortProfitPercentage(shortProfitRatio * 100 < -100 ? -100 : shortProfitRatio * 100)
      }
      if (longShares && collateral && !isDust(longShares, collateral.decimals)) {
        const totalLongPriceNumber = Number(formatBigNumber(totalLongPrice, collateral.decimals, collateral.decimals))
        const longPayoutAmount = (longSharesNumber || 0) * (scaleValue / 100)
        const longProfit = longPayoutAmount - totalLongPriceNumber
        const longProfitRatio = longPayoutAmount / totalLongPriceNumber - 1
        setLongPayout(longPayoutAmount)
        setLongProfitAmount(longProfit)
        setLongProfitPercentage(longProfitRatio * 100 < -100 ? -100 : longProfitRatio * 100)
      }
    }
  }, [
    scaleValuePrediction,
    amountNumber,
    long,
    lowerBoundNumber,
    newPredictionNumber,
    upperBoundNumber,
    feeNumber,
    longShares,
    longSharesNumber,
    scaleValue,
    short,
    shortShares,
    shortSharesNumber,
    totalLongPrice,
    totalShortPrice,
    amountSharesNumber,
    collateral,
    longPayout,
    shortPayout,
  ])

  const activateTooltip = () => {
    const scaleTooltip: HTMLElement | null = document.querySelector('#scale-tooltip')
    if (scaleTooltip) {
      scaleTooltip.style.opacity = '1'
    }
  }

  const deactivateTooltip = () => {
    const scaleTooltip: HTMLElement | null = document.querySelector('#scale-tooltip')
    if (scaleTooltip) {
      scaleTooltip.style.opacity = '0'
    }
  }

  const isSliderEnabled =
    isAmountInputted ||
    (positionTable &&
      collateral &&
      (!isDust(shortShares || new BigNumber(0), collateral.decimals) ||
        !isDust(longShares || new BigNumber(0), collateral.decimals)))

  const isPositionTableDisabled =
    !positionTable ||
    status !== Status.Ready ||
    !trades ||
    !balances ||
    !collateral ||
    (isDust(shortShares || new BigNumber(0), collateral.decimals) &&
      isDust(longShares || new BigNumber(0), collateral.decimals))

  return (
    <>
      <ScaleWrapper borderBottom={isPositionTableDisabled} borderTop={borderTop} valueBoxes={isAmountInputted}>
        <ScaleTitleWrapper>
          <ScaleTitle>
            {formatNumber(lowerBoundNumber.toString())} {unit}
          </ScaleTitle>
          <ScaleTitle>
            {formatNumber(`${upperBoundNumber / 2 + lowerBoundNumber / 2}`)}
            {` ${unit}`}
          </ScaleTitle>
          <ScaleTitle>
            {upperBound && formatBigNumber(upperBound, 18)} {unit}
          </ScaleTitle>
        </ScaleTitleWrapper>
        <Scale>
          <ScaleBallContainer>
            <ScaleTooltip id="scale-tooltip" xValue={scaleValue || 0}>
              <ScaleTooltipMessage>{`${formatNumber(scaleValuePrediction.toString())} ${unit}`}</ScaleTooltipMessage>
            </ScaleTooltip>
            <ScaleBall
              className="scale-ball"
              disabled={!isSliderEnabled}
              max="100"
              min="0"
              onChange={handleScaleBallChange}
              onMouseDown={activateTooltip}
              onMouseUp={deactivateTooltip}
              type="range"
              value={scaleValue}
            />
          </ScaleBallContainer>
          {positionTable && currentPrediction && (
            <>
              <ScaleDot positive={undefined} xValue={Number(currentPrediction)} />
              <HorizontalBarChange
                start={
                  Number(currentPrediction) < (scaleValue || 0) / 100
                    ? Number(currentPrediction)
                    : (scaleValue || 0) / 100
                }
                width={
                  Number(currentPrediction) < (scaleValue || 0) / 100
                    ? (scaleValue || 0) / 100 - Number(currentPrediction)
                    : Number(currentPrediction) - (scaleValue || 0) / 100
                }
              />
            </>
          )}
          {isAmountInputted && (
            <>
              <ScaleDot
                positive={
                  (long && (newPrediction || 0) <= Number(currentPrediction)) ||
                  (!long && (newPrediction || 0) >= Number(currentPrediction))
                }
                xValue={Number(currentPrediction)}
              />
              <ScaleDot positive={true} xValue={newPrediction || 0} />
            </>
          )}
          <VerticalBar position={0} positive={isAmountInputted ? !long : null} />
          <VerticalBar
            position={1}
            positive={
              isAmountInputted ? (long && (newPrediction || 0) <= 0.5) || (!long && (newPrediction || 0) >= 0.5) : null
            }
          />
          <VerticalBar position={2} positive={isAmountInputted ? !!long : null} />
          <HorizontalBar />
          {isAmountInputted && (
            <>
              <HorizontalBarLeft positive={!long || null} width={newPrediction || 0} />
              <HorizontalBarRight positive={long || null} width={1 - (newPrediction || 0)} />
            </>
          )}
          {!isAmountInputted && (
            <ValueBoxRegular
              xValue={
                currentPrediction
                  ? Number(currentPrediction)
                  : (Number(startingPoint) - Number(lowerBound)) / (Number(upperBound) - Number(lowerBound))
              }
            >
              <ValueBoxTitle>
                {currentPrediction
                  ? formatNumber(currentPredictionNumber.toString())
                  : startingPoint && startingPointNumber}
                {currentPrediction || startingPoint ? ` ${unit}` : 'Unknown'}
              </ValueBoxTitle>
              <ValueBoxSubtitle>{startingPointTitle}</ValueBoxSubtitle>
            </ValueBoxRegular>
          )}
        </Scale>
        {isAmountInputted && (
          <ValueBoxes>
            <ValueBoxPair>
              <ValueBox>
                <ValueBoxTitle>
                  {formatNumber(currentPredictionNumber.toString())} {unit}
                </ValueBoxTitle>
                <ValueBoxSubtitle>Current Prediction</ValueBoxSubtitle>
              </ValueBox>
              <ValueBox>
                <ValueBoxTitle>
                  {formatNumber(scaleValuePrediction.toString())} {unit}
                </ValueBoxTitle>
                <ValueBoxSubtitle>New Prediction</ValueBoxSubtitle>
              </ValueBox>
            </ValueBoxPair>
            <ValueBoxPair>
              <ValueBox>
                <ValueBoxTitle
                  positive={
                    yourPayout > (amountNumber || 0) ? true : yourPayout < (amountNumber || 0) ? false : undefined
                  }
                >
                  {`${formatNumber(yourPayout.toString())} ${collateral && collateral.symbol}`}
                </ValueBoxTitle>
                <ReactTooltip id="payoutTooltip" />
                <ValueBoxSubtitle>
                  Your Payout
                  <Circle
                    data-delay-hide={'500'}
                    data-effect={'solid'}
                    data-for={'payoutTooltip'}
                    data-multiline={'true'}
                    data-tip={`Your payout if the market resolves at ${formatNumber(
                      scaleValuePrediction.toString(),
                    )} ${unit}`}
                  >
                    <IconInfo />
                  </Circle>
                </ValueBoxSubtitle>
              </ValueBox>
              <ValueBox>
                <ValueBoxTitle positive={profitLoss > 0 ? true : profitLoss < 0 ? false : undefined}>
                  {profitLoss > 0 && '+'}
                  {`${formatNumber(profitLoss ? profitLoss.toString() : '0')} ${collateral && collateral.symbol}`}
                </ValueBoxTitle>
                <ReactTooltip id="profitTooltip" />
                <ValueBoxSubtitle>
                  Profit/Loss
                  <Circle
                    data-delay-hide={'500'}
                    data-effect={'solid'}
                    data-for={'profitTooltip'}
                    data-multiline={'true'}
                    data-tip={`Your profit/loss if the market resolves at ${formatNumber(
                      scaleValuePrediction.toString(),
                    )} ${unit}`}
                  >
                    <IconInfo />
                  </Circle>
                </ValueBoxSubtitle>
              </ValueBox>
            </ValueBoxPair>
          </ValueBoxes>
        )}
      </ScaleWrapper>
      {!isPositionTableDisabled && balances && collateral && trades && (
        <PositionTable
          balances={balances}
          collateral={collateral}
          fee={fee}
          longPayout={longPayout}
          longProfitLoss={longProfitAmount}
          longProfitLossPercentage={longProfitPercentage}
          shortPayout={shortPayout}
          shortProfitLoss={shortProfitAmount}
          shortProfitLossPercentage={shortProfitPercentage}
        />
      )}
    </>
  )
}
