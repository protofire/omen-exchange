import { BigNumber } from 'ethers/utils'
import React from 'react'
import styled from 'styled-components'

import { formatBigNumber, formatNumber } from '../../../../util/tools'

const ScaleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 182px;
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

const StartingPointBox = styled.div<{ xValue: number }>`
  position: absolute;
  padding: 12px;
  border: 1px solid ${props => props.theme.scale.box};
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  bottom: 24px;
  ${props =>
    props.xValue <= 0.885
      ? `left: ${props.xValue <= 0.115 ? `25px` : props.xValue <= 0.885 ? `${props.xValue * 100}%` : ``}`
      : `right: 25px`}
  transform: translateX(
    ${props =>
      props.xValue < 0.5 && props.xValue >= 0.115
        ? `calc(-50% + 12px)`
        : props.xValue > 0.5 && props.xValue <= 0.885
        ? `calc(-50% - 12px)`
        : props.xValue === 0.5
        ? `-50%`
        : `0`}
  );
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
  startingPoint: BigNumber
  unit: string
  upperBound: BigNumber
  decimals: number
}

export const MarketScale: React.FC<Props> = (props: Props) => {
  const { decimals, lowerBound, startingPoint, unit, upperBound } = props

  return (
    <ScaleWrapper>
      <ScaleTitleWrapper>
        <ScaleTitle>
          {lowerBound && formatNumber(formatBigNumber(lowerBound, decimals))} {unit}
        </ScaleTitle>
        <ScaleTitle>
          {upperBound &&
            lowerBound &&
            formatNumber(
              `${Number(formatBigNumber(upperBound, decimals)) / 2 +
                Number(formatBigNumber(lowerBound, decimals)) / 2}`,
            )}
          {` ${unit}`}
        </ScaleTitle>
        <ScaleTitle>
          {upperBound && formatBigNumber(upperBound, decimals)} {unit}
        </ScaleTitle>
      </ScaleTitleWrapper>
      <Scale>
        <ScaleBall xValue={(Number(startingPoint) - Number(lowerBound)) / (Number(upperBound) - Number(lowerBound))} />
        <VerticalBar />
        <VerticalBar />
        <VerticalBar />
        <HorizontalBar />
      </Scale>
      <StartingPointBox
        xValue={(Number(startingPoint) - Number(lowerBound)) / (Number(upperBound) - Number(lowerBound))}
      >
        <StartingPointTitle>
          {startingPoint && formatBigNumber(startingPoint, decimals)} {unit}
        </StartingPointTitle>
        <StartingPointSubtitle>Starting Point</StartingPointSubtitle>
      </StartingPointBox>
    </ScaleWrapper>
  )
}
