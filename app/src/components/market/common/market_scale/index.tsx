import { BigNumber } from 'ethers/utils'
import React from 'react'
import styled from 'styled-components'

import { formatBigNumber, formatNumber } from '../../../../util/tools'

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

const VerticalBar = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  height: 20px;
  background: ${props => props.theme.scale.bar};

  &:nth-of-type(1) {
    left: 0;
  }

  &:nth-of-type(2) {
    left: calc(50% - 1px);
  }

  &:nth-of-type(3) {
    right: 0;
  }
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

const ScaleBall = styled.div<{ xValue: number }>`
  position: absolute;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  border: 3px solid ${props => props.theme.scale.ballBorder};
  background: ${props => props.theme.scale.ballBackground};
  z-index: 2;
  left: ${props => props.xValue * 100}%;
  transform: translateX(-50%);
`

const ScaleDot = styled.div<{ xValue: number }>`
  position: absolute;
  height: 8px;
  width: 8px;
  // TODO: Set color dynamically
  background: black;
  border-radius: 50%;
  z-index: 2;
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
  // border-radius: 4px;
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
}

export const MarketScale: React.FC<Props> = (props: Props) => {
  const { currentPrediction, lowerBound, newPrediction, startingPoint, startingPointTitle, unit, upperBound } = props

  const decimals = 18

  const lowerBoundNumber = lowerBound && Number(formatBigNumber(lowerBound, decimals))
  const upperBoundNumber = upperBound && Number(formatBigNumber(upperBound, decimals))
  const startingPointNumber = startingPoint && Number(formatBigNumber(startingPoint || new BigNumber(0), decimals))

  const currentPredictionNumber = Number(currentPrediction) * (upperBoundNumber - lowerBoundNumber) + lowerBoundNumber
  const newPredictionNumber = Number(newPrediction) * (upperBoundNumber - lowerBoundNumber) + lowerBoundNumber

  const isAmountInputted = newPrediction && newPrediction !== Number(currentPrediction)

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
        <ScaleBall
          xValue={
            newPrediction
              ? newPrediction
              : currentPrediction
              ? Number(currentPrediction)
              : (startingPointNumber || 0 - lowerBoundNumber) / (upperBoundNumber - lowerBoundNumber)
          }
        />
        {isAmountInputted && <ScaleDot xValue={Number(currentPrediction)} />}
        <VerticalBar />
        <VerticalBar />
        <VerticalBar />
        <HorizontalBar />
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
                {formatNumber(newPredictionNumber.toString())} {unit}
              </ValueBoxTitle>
              <ValueBoxSubtitle>New Prediction</ValueBoxSubtitle>
            </ValueBox>
          </ValueBoxPair>
          <ValueBoxPair>
            <ValueBox>
              {/* TODO: Replace hardcoded value and collateral symbol */}
              <ValueBoxTitle>{'0.00 DAI'}</ValueBoxTitle>
              <ValueBoxSubtitle>Your Payout</ValueBoxSubtitle>
            </ValueBox>
            <ValueBox>
              {/* TODO: Replace hardcoded value */}
              <ValueBoxTitle>{'0.00%'}</ValueBoxTitle>
              <ValueBoxSubtitle>Profit/Loss</ValueBoxSubtitle>
            </ValueBox>
          </ValueBoxPair>
        </ValueBoxes>
      )}
    </ScaleWrapper>
  )
}
