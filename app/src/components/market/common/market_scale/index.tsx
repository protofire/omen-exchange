import { BigNumber } from 'ethers/utils'
import React, { useEffect, useRef, useState } from 'react'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'

import { DUST } from '../../../../common/constants'
import { formatBigNumber, formatNumber } from '../../../../util/tools'
import { BalanceItem, Status, Token, TradeObject } from '../../../../util/types'
import { PositionTable } from '../position_table'

const SCALE_HEIGHT = '20px'
const BAR_WIDTH = '2px'
const BALL_SIZE = '20px'
const DOT_SIZE = '8px'
const VALUE_BOXES_MARGIN = '12px'

const ScaleWrapper = styled.div<{ borderBottom: boolean | undefined; borderTop: boolean | undefined }>`
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

const ScaleDot = styled.div<{ xValue: number; positive: Maybe<boolean> }>`
  position: absolute;
  height: ${DOT_SIZE};
  width: ${DOT_SIZE};
  background: ${props => (props.positive ? `${props.theme.scale.positive}` : `${props.theme.scale.negative}`)};
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
`

const ValueBoxPair = styled.div`
  width: calc(50% - ${VALUE_BOXES_MARGIN} / 2);
  display: flex;
  align-items: center;
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
`

interface Props {
  lowerBound: BigNumber
  startingPoint?: Maybe<BigNumber>
  unit: string
  upperBound: BigNumber
  startingPointTitle: string
  currentPrediction?: Maybe<string>
  borderBottom?: boolean
  borderTop?: boolean
  newPrediction?: Maybe<number>
  long?: Maybe<boolean>
  short?: Maybe<boolean>
  potentialLoss?: Maybe<BigNumber>
  potentialProfit?: Maybe<BigNumber>
  collateral?: Maybe<Token>
  amount?: Maybe<BigNumber>
  positionTable?: Maybe<boolean>
  trades?: Maybe<TradeObject[]>
  status?: Maybe<Status>
  balances?: Maybe<BalanceItem[]>
  fee?: Maybe<BigNumber>
  slider?: Maybe<boolean>
}

export const MarketScale: React.FC<Props> = (props: Props) => {
  const {
    amount,
    balances,
    borderBottom,
    borderTop,
    collateral,
    currentPrediction,
    fee,
    long,
    lowerBound,
    newPrediction,
    positionTable,
    potentialLoss,
    potentialProfit,
    short,
    slider,
    startingPoint,
    startingPointTitle,
    status,
    trades,
    unit,
    upperBound,
  } = props

  const decimals = 18

  const lowerBoundNumber = lowerBound && Number(formatBigNumber(lowerBound, decimals))
  const upperBoundNumber = upperBound && Number(formatBigNumber(upperBound, decimals))
  const startingPointNumber = startingPoint && Number(formatBigNumber(startingPoint || new BigNumber(0), decimals))

  const currentPredictionNumber = Number(currentPrediction) * (upperBoundNumber - lowerBoundNumber) + lowerBoundNumber
  const newPredictionNumber = Number(newPrediction) * (upperBoundNumber - lowerBoundNumber) + lowerBoundNumber

  const potentialProfitNumber =
    collateral && Number(formatBigNumber(potentialProfit || new BigNumber(0), collateral.decimals))
  const potentialLossNumber =
    collateral && Number(formatBigNumber(potentialLoss || new BigNumber(0), collateral.decimals))

  const amountNumber = collateral && Number(formatBigNumber(amount || new BigNumber(0), collateral.decimals))
  const feeNumber = fee && collateral && (Number(formatBigNumber(fee, collateral.decimals)) + 1) ** 2 - 1

  const shortShares =
    balances &&
    balances
      .filter(balance => balance.outcomeName === 'short')
      .map(shortBalance => shortBalance.shares)
      .reduce((a, b) => a.add(b))

  const longShares =
    balances &&
    balances
      .filter(balance => balance.outcomeName === 'long')
      .map(longBalance => longBalance.shares)
      .reduce((a, b) => a.add(b))

  const shortSharesNumber = collateral && Number(formatBigNumber(shortShares || new BigNumber(0), 18))
  const longSharesNumber = collateral && Number(formatBigNumber(longShares || new BigNumber(0), 18))

  const [isAmountInputted, setIsAmountInputted] = useState(false)

  const initialMount = useRef(true)
  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false
      return
    }
    setIsAmountInputted(newPrediction ? newPrediction !== Number(currentPrediction) : false)
  }, [newPrediction, currentPrediction])

  const [scaleValue, setScaleValue] = useState<number | undefined>(
    newPrediction
      ? newPrediction * 100
      : currentPrediction
      ? Number(currentPrediction) * 100
      : ((startingPointNumber || 0 - lowerBoundNumber) / (upperBoundNumber - lowerBoundNumber)) * 100,
  )
  const [scaleValuePrediction, setScaleValuePrediction] = useState(newPredictionNumber)
  const [yourPayout, setYourPayout] = useState(0)
  const [profitLoss, setProfitLoss] = useState(0)
  const [shortPayout, setShortPayout] = useState(0)
  const [shortProfitLoss, setShortProfitLoss] = useState(0)
  const [longPayout, setLongPayout] = useState(0)
  const [longProfitLoss, setLongProfitLoss] = useState(0)
  const [totalShortPrice, setTotalShortPrice] = useState<number>(0)
  const [totalLongPrice, setTotalLongPrice] = useState<number>(0)

  useEffect(() => {
    if (trades && trades.length) {
      setTotalShortPrice(
        trades
          .filter(trade => trade.outcomeIndex === '0')
          .map(trade => trade.outcomeTokenMarginalPrice)
          .reduce((a, b) => a + b),
      )
      setTotalLongPrice(
        trades
          .filter(trade => trade.outcomeIndex === '1')
          .map(trade => trade.outcomeTokenMarginalPrice)
          .reduce((a, b) => a + b),
      )
    }
  }, [trades])

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
    let positionValue
    // If taking a long position
    if (long) {
      // If the value selected by the slider is > the new prediction number
      if (scaleValuePrediction > newPredictionNumber) {
        // Determine the percentage distance from the new prediction number to the upper bound
        positionValue = (scaleValuePrediction - newPredictionNumber) / (upperBoundNumber - newPredictionNumber)
        // Calculate profit amount given how close it is to the upper bound, i.e. how close it is to max profit
        const profit = positionValue * (potentialProfitNumber || 0) - (feeNumber || 0)
        // Calculate total payout by adding profit to amount
        setYourPayout((amountNumber || 0) + profit)
        // Return profit amount
        setProfitLoss(profit)
      } else {
        // Determine the percentage distance from the new prediction number to the lower bound as a negative value
        positionValue = -(scaleValuePrediction - newPredictionNumber) / (lowerBoundNumber - newPredictionNumber)
        // Calculate loss amount given how close it is to lower bound, i.e. how close it is to max loss
        const loss = positionValue * (potentialLossNumber || 0) - (feeNumber || 0)
        // Calculate total payout by adding loss to amount
        setYourPayout((amountNumber || 0) + loss)
        // Return loss amount
        setProfitLoss(loss)
      }
    } else if (short) {
      // If the value selected by the slider is < the new prediction number
      if (scaleValuePrediction <= newPredictionNumber) {
        // Determine the percentage distance from the new prediction number to the lower bound
        positionValue = (newPredictionNumber - scaleValuePrediction) / (newPredictionNumber - lowerBoundNumber)
        // Calculate profit amount given how close it is to the lower bound, i.e. how close it is to max profit
        const profit = positionValue * (potentialProfitNumber || 0) - (feeNumber || 0)
        // Calculate total payout by adding profit to amount
        setYourPayout((amountNumber || 0) + profit)
        // Return profit amount
        setProfitLoss(profit)
      } else {
        // Determine the percentage distance from the new prediction number to the upper bound as a negative value
        positionValue = -(scaleValuePrediction - newPredictionNumber) / (upperBoundNumber - newPredictionNumber)
        // Calculate loss amount given how close it is to upper bound, i.e. how close it is to max loss
        const loss = positionValue * (potentialLossNumber || 0) - (feeNumber || 0)
        // Calculate total payout by adding loss to amount
        setYourPayout((amountNumber || 0) + loss)
        // Return loss amount
        setProfitLoss(loss)
      }
    } else {
      if (shortShares && shortShares.gt(DUST)) {
        setShortPayout((shortSharesNumber || 0) * (1 - Number(scaleBall?.value) / 100))
        console.log(totalShortPrice)
        setShortProfitLoss((shortSharesNumber || 0) * (1 - Number(scaleBall?.value) / 100) - (totalShortPrice || 0))
      }
      if (longShares && longShares.gt(DUST)) {
        setLongPayout((longSharesNumber || 0) * (Number(scaleBall?.value) / 100))
        setLongProfitLoss((longSharesNumber || 0) * (Number(scaleBall?.value) / 100) - (totalLongPrice || 0))
      }
    }
  }, [
    scaleValuePrediction,
    amountNumber,
    long,
    lowerBoundNumber,
    newPredictionNumber,
    potentialLossNumber,
    potentialProfitNumber,
    upperBoundNumber,
    feeNumber,
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

  const isSliderDisabled = !isAmountInputted && shortShares?.lte(DUST) && longShares?.lte(DUST)

  return (
    <>
      <ScaleWrapper borderBottom={borderBottom} borderTop={borderTop}>
        <ScaleTitleWrapper>
          <ScaleTitle>
            {formatNumber(lowerBoundNumber.toString())} {unit}
          </ScaleTitle>
          <ScaleTitle>
            {formatNumber(`${upperBoundNumber / 2 + lowerBoundNumber / 2}`)}
            {` ${unit}`}
          </ScaleTitle>
          <ScaleTitle>
            {upperBound && formatBigNumber(upperBound, decimals)} {unit}
          </ScaleTitle>
        </ScaleTitleWrapper>
        <Scale>
          <ScaleBallContainer>
            <ScaleTooltip id="scale-tooltip" xValue={scaleValue || 0}>
              <ScaleTooltipMessage>{`${formatNumber(scaleValuePrediction.toString())} ${unit}`}</ScaleTooltipMessage>
            </ScaleTooltip>
            <ScaleBall
              className="scale-ball"
              data-for="scalarTooltip"
              data-tip={`${formatNumber(scaleValuePrediction.toString())} ${unit}`}
              disabled={isSliderDisabled}
              max="100"
              min="0"
              onChange={handleScaleBallChange}
              onMouseDown={activateTooltip}
              onMouseUp={deactivateTooltip}
              type="range"
              value={scaleValue}
            />
          </ScaleBallContainer>
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
                {` ${unit}`}
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
                <ValueBoxSubtitle>Your Payout</ValueBoxSubtitle>
              </ValueBox>
              <ValueBox>
                <ValueBoxTitle positive={profitLoss > 0 ? true : profitLoss < 0 ? false : undefined}>
                  {profitLoss > 0 && '+'}
                  {`${formatNumber(profitLoss ? profitLoss.toString() : '0')} ${collateral && collateral.symbol}`}
                </ValueBoxTitle>
                <ValueBoxSubtitle>Profit/Loss</ValueBoxSubtitle>
              </ValueBox>
            </ValueBoxPair>
          </ValueBoxes>
        )}
      </ScaleWrapper>
      {positionTable &&
        status === Status.Ready &&
        trades &&
        balances &&
        currentPrediction &&
        collateral &&
        !!trades.length && (
          <PositionTable
            balances={balances}
            collateral={collateral}
            currentPrediction={
              scaleValue || scaleValue === 0
                ? (scaleValue / 100 === 0 ? 0.0001 : scaleValue / 100).toString()
                : currentPrediction
            }
            fee={fee}
            longPayout={longPayout}
            longProfitLoss={longProfitLoss}
            shortPayout={shortPayout}
            shortProfitLoss={shortProfitLoss}
            trades={trades}
          />
        )}
    </>
  )
}
