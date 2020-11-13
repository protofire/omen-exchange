import { BigNumber } from 'ethers/utils'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import { formatBigNumber, formatNumber } from '../../../../util/tools'
import { Token } from '../../../../util/types'

const ScaleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 186px;
  border-bottom: 1px solid ${props => props.theme.scale.bar};
  margin-left: -24px;
  margin-right: -24px;
  padding-left: 24px;
  padding-right: 24px;
  position: relative;
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
  height: 20px;
  width: 100%;
`

const VerticalBar = styled.div<{ position: number; positive: Maybe<boolean> }>`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  height: 20px;

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
  top: calc(50% - 1px);
  left: 0;
  right: 0;
  width: 100%
  height: 2px;
  background: ${props => props.theme.scale.bar};
`

const HorizontalBarLeft = styled.div<{ positive: boolean | null; width: number }>`
  position: absolute;
  top: calc(50% - 1px);
  left: 0;
  width: ${props => props.width * 100}%;
  background: ${props => (props.positive ? `${props.theme.scale.positive}` : `${props.theme.scale.negative}`)};
  height: 2px;
  z-index: 2;
`

const HorizontalBarRight = styled.div<{ positive: boolean | null; width: number }>`
  position: absolute;
  top: calc(50% - 1px);
  right: 0;
  width: ${props => props.width * 100}%;
  background: ${props => (props.positive ? `${props.theme.scale.positive}` : `${props.theme.scale.negative}`)};
  height: 2px;
  z-index: 2;
`

const ScaleBallContainer = styled.div`
  width: 100%;
`

const ScaleBall = styled.input`
  height: 20px;
  width: calc(100% + 20px);
  background: none;
  outline: none;
  -webkit-appearance: none;
  z-index: 4;
  position: absolute;
  left: -10px;
  right: -10px;

  &::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    border: 3px solid ${props => props.theme.scale.ballBorder};
    background: ${props => props.theme.scale.ballBackground};
    cursor: pointer;
  }

  &::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    border: 3px solid ${props => props.theme.scale.ballBorder};
    background: ${props => props.theme.scale.ballBackground};
    cursor: pointer;
  }
`

const ScaleDot = styled.div<{ xValue: number; positive: Maybe<boolean> }>`
  position: absolute;
  height: 8px;
  width: 8px;
  background: ${props => (props.positive ? `${props.theme.scale.positive}` : `${props.theme.scale.negative}`)};
  border-radius: 50%;
  z-index: 3;
  left: ${props => props.xValue * 100}%;
  transform: translateX(-50%);
  margin-top: 6px;
`

const ValueBoxes = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24px;
  width: 100%;
`

const ValueBoxPair = styled.div`
  width: calc(50% - 6px);
  display: flex;
  align-items: center;
`

const ValueBox = styled.div<{ xValue?: number }>`
  padding: 12px;
  border: 1px solid ${props => props.theme.scale.box};
  display: flex;
  flex-direction: column;
  align-items: center;
  top: 44px;
  ${props =>
    props.xValue
      ? props.xValue <= 0.885
        ? `left: ${
            props.xValue <= 0.115
              ? `25px`
              : props.xValue <= 0.885
              ? `${props.xValue * 100}%; transform: translateX(-50%); position: absolute;`
              : ``
          }`
        : `right: 25px; transform: translateX(-50%); position: absolute;`
      : 'width: 50%;'}
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
  }
`

const ValueBoxTitle = styled.p`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.colors.textColorDarker};
  margin-bottom: 6px;
  margin-top: 0;
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
  newPrediction?: Maybe<number>
  long?: Maybe<boolean>
  potentialLoss?: Maybe<BigNumber>
  potentialProfit?: Maybe<BigNumber>
  collateral?: Maybe<Token>
  amount?: Maybe<BigNumber>
}

export const MarketScale: React.FC<Props> = (props: Props) => {
  const {
    amount,
    collateral,
    currentPrediction,
    long,
    lowerBound,
    newPrediction,
    potentialLoss,
    potentialProfit,
    startingPoint,
    startingPointTitle,
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

  const [isAmountInputted, setIsAmountInputted] = useState(false)

  useEffect(() => {
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
        : ((startingPointNumber || 0 - lowerBoundNumber) / (upperBoundNumber - lowerBoundNumber)) * 100,
    )
    setScaleValuePrediction(Number(newPrediction) * (upperBoundNumber - lowerBoundNumber) + lowerBoundNumber)
  }, [newPrediction, currentPrediction, lowerBoundNumber, startingPointNumber, upperBoundNumber])

  useEffect(() => {
    let positionValue
    if (long) {
      if (scaleValuePrediction > newPredictionNumber) {
        positionValue = (scaleValuePrediction - newPredictionNumber) / (upperBoundNumber - newPredictionNumber)
        setYourPayout(positionValue * (potentialProfitNumber || 0))
        setProfitLoss(((positionValue * (potentialProfitNumber || 0)) / (amountNumber || 0)) * 100)
      } else {
        positionValue = -(scaleValuePrediction - newPredictionNumber) / (lowerBoundNumber - newPredictionNumber)
        setYourPayout(
          positionValue * (potentialLossNumber || 0) < -(amountNumber || 0)
            ? -(amountNumber || 0)
            : positionValue * (potentialLossNumber || 0),
        )
        setProfitLoss(
          -(-(positionValue * (potentialLossNumber || 0)) / (amountNumber || 0)) * 100 < -100
            ? -100
            : -(-(positionValue * (potentialLossNumber || 0)) / (amountNumber || 0)) * 100,
        )
      }
    } else {
      if (scaleValuePrediction <= newPredictionNumber) {
        positionValue = (newPredictionNumber - scaleValuePrediction) / (newPredictionNumber - lowerBoundNumber)
        setYourPayout(positionValue * (potentialProfitNumber || 0))
        setProfitLoss(((positionValue * (potentialProfitNumber || 0)) / (amountNumber || 0)) * 100)
      } else {
        positionValue = (newPredictionNumber - scaleValuePrediction) / (newPredictionNumber - lowerBoundNumber)
        setYourPayout(
          positionValue * (potentialLossNumber || 0) < -(amountNumber || 0)
            ? -(amountNumber || 0)
            : positionValue * (potentialLossNumber || 0),
        )
        setProfitLoss(
          -(-(positionValue * (potentialLossNumber || 0)) / (amountNumber || 0)) * 100 < -100
            ? -100
            : -(-(positionValue * (potentialLossNumber || 0)) / (amountNumber || 0)) * 100,
        )
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
  ])

  console.log(yourPayout)

  return (
    <ScaleWrapper>
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
          <ScaleBall
            className="scale-ball"
            disabled={!isAmountInputted}
            max="100"
            min="0"
            onChange={handleScaleBallChange}
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
          <ValueBox
            xValue={
              currentPrediction
                ? Number(currentPrediction)
                : (Number(startingPoint) - Number(lowerBound)) / (Number(upperBound) - Number(lowerBound))
            }
          >
            <ValueBoxTitle>
              {currentPrediction ? currentPredictionNumber : startingPoint && startingPointNumber}
              {` ${unit}`}
            </ValueBoxTitle>
            <ValueBoxSubtitle>{startingPointTitle}</ValueBoxSubtitle>
          </ValueBox>
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
              <ValueBoxTitle>{`${formatNumber(yourPayout.toString())} DAI`}</ValueBoxTitle>
              <ValueBoxSubtitle>Your Payout</ValueBoxSubtitle>
            </ValueBox>
            <ValueBox>
              <ValueBoxTitle>{`${formatNumber(profitLoss.toString())}%`}</ValueBoxTitle>
              <ValueBoxSubtitle>Profit/Loss</ValueBoxSubtitle>
            </ValueBox>
          </ValueBoxPair>
        </ValueBoxes>
      )}
    </ScaleWrapper>
  )
}
