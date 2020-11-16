import { BigNumber } from 'ethers/utils'
import React from 'react'
import styled from 'styled-components'

import { formatBigNumber, formatNumber } from '../../../../util/tools'

const ScaleWrapper = styled.div<{ border: boolean | undefined }>`
  display: flex;
  flex-direction: column;
  height: 186px;
  border-bottom: 1px solid ${props => props.theme.scale.bar};
  margin-left: -24px;
  margin-right: -24px;
  padding-left: 24px;
  padding-right: 24px;
  position: relative;
  ${props => props.border && `border-top: 1px solid ${props.theme.scale.border}; padding-top: 24px; height: 210px;`};
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

const StartingPointBox = styled.div<{ xValue: number }>`
  position: absolute;
  padding: 12px;
  border: 1px solid ${props => props.theme.scale.box};
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  top: 44px;
  ${props =>
    props.xValue <= 0.885
      ? `left: ${props.xValue <= 0.115 ? `25px` : props.xValue <= 0.885 ? `${props.xValue * 100}%` : ``}`
      : `right: 25px`}
  transform: translateX(-50%);
  background: white;
`

const StartingPointTitle = styled.p`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.colors.textColorDarker};
  margin-bottom: 6px;
  margin-top: 0;
`

const StartingPointSubtitle = styled.p`
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
  border?: boolean
}

export const MarketScale: React.FC<Props> = (props: Props) => {
  const { border, currentPrediction, lowerBound, startingPoint, startingPointTitle, unit, upperBound } = props

  const decimals = 18

  const lowerBoundNumber = lowerBound && Number(formatBigNumber(lowerBound, decimals))
  const upperBoundNumber = upperBound && Number(formatBigNumber(upperBound, decimals))
  const startingPointNumber = startingPoint && Number(formatBigNumber(startingPoint || new BigNumber(0), decimals))

  return (
    <ScaleWrapper border={border}>
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
            currentPrediction
              ? Number(currentPrediction)
              : (startingPointNumber || 0 - lowerBoundNumber) / (upperBoundNumber - lowerBoundNumber)
          }
        />
        <VerticalBar />
        <VerticalBar />
        <VerticalBar />
        <HorizontalBar />
        <StartingPointBox
          xValue={
            currentPrediction
              ? Number(currentPrediction)
              : (Number(startingPoint) - Number(lowerBound)) / (Number(upperBound) - Number(lowerBound))
          }
        >
          <StartingPointTitle>
            {currentPrediction
              ? Number(currentPrediction) * (upperBoundNumber - lowerBoundNumber) + lowerBoundNumber
              : startingPoint && startingPointNumber}
            {` ${unit}`}
          </StartingPointTitle>
          <StartingPointSubtitle>{startingPointTitle}</StartingPointSubtitle>
        </StartingPointBox>
      </Scale>
    </ScaleWrapper>
  )
}
