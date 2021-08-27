import moment from 'moment'
import React from 'react'
import styled from 'styled-components'

import { TYPE } from '../../../theme'
import { bigNumberToString, isScalarMarket, limitDecimalPlaces } from '../../../util/tools'
import { MarketMakerDataItem } from '../../../util/types'
import {
  HorizontalBarChange,
  Scale,
  ScaleDot,
  ScaleTooltip,
  ScaleTooltipMessage,
} from '../common_sections/card_bottom_details/market_scale'
import { CurationRadioWrapper } from '../common_styled'

const ClosingWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`

const StyledMarketCard = styled.div<{ active?: boolean }>`
  flex-basis: calc(33.33% - 13.3px);
  border: 1px solid ${props => (props.active ? props.theme.colors.borderColorDark : props.theme.colors.tertiary)};
  padding: 28px;
  margin-top: 20px;
  box-sizing: border-box;
  border-radius: 12px;

  &:hover {
    border-color: ${props => (props.active ? props.theme.colors.borderColorDark : '#D2D6ED')};
    cursor: pointer;
  }

  @media (max-width: ${props => props.theme.themeBreakPoints.sm}) {
    flex-basis: 100%;
    margin-left: 0 !important;
  }
`

const RadioWrapper = styled(CurationRadioWrapper as any)`
  width: 20px;
  height: 20px;
  border: none;
`

const Tick = () => (
  <svg fill="none" height="10" viewBox="0 0 12 10" width="12" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3.99996 9.70842L0.166626 5.87508L1.83329 4.29175L3.99996 6.45841L10.1666 0.291748L11.8333 1.95841L3.99996 9.70842Z"
      fill="white"
    />
  </svg>
)

const TitleWrapper = styled.div`
  height: 54px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;

  @media (max-width: ${props => props.theme.themeBreakPoints.sm}) {
    height: auto;
  }
`

const DetailsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`

const OutcomeWrapper = styled.div`
  border: 1px solid ${props => props.theme.colors.verticalDivider};
  box-sizing: border-box;
  border-radius: 8px;
  margin-bottom: 16px;

  & > div:not(:first-child) {
    border-top: 1px solid ${props => props.theme.colors.verticalDivider};
  }
`

const OutcomeRow = styled.div`
  padding: 10px 16px;
  display: flex;
  justify-content: space-between;
`

const ScaleWrapper = styled.div`
  border: 1px solid ${props => props.theme.colors.verticalDivider};
  box-sizing: border-box;
  border-radius: 8px;
  margin-bottom: 16px;
  padding: 13px 0px;
  height: 76px;
`

const PercWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 29px;
`

const Tooltip = styled(ScaleTooltip as any)`
  margin-top: 10px;
`

interface Props {
  active: boolean
  market: MarketMakerDataItem
  networkId: number
  onClick?: () => void
}

export const MarketCard = (props: Props) => {
  const { active, market, networkId, onClick } = props

  const resolutionDate = moment(market.openingTimestamp).format('Do MMMM YYYY')
  const formattedLiquidity: string = bigNumberToString(market.totalPoolShares, market.collateral.decimals)
  const formattedVolume: string = bigNumberToString(market.collateralVolume, market.collateral.decimals)

  const isScalar = isScalarMarket(market.oracle || '', networkId || 0)

  const firstOutcome = market.outcomes && market.outcomes[0]
  const firstOutcomePerc = limitDecimalPlaces(market.outcomeTokenMarginalPrices[0], 2) * 100
  const secondOutcome =
    market.outcomes && market.outcomes.length > 2
      ? `+${market.outcomes.length - 1} Outcomes`
      : market.outcomes && market.outcomes[1]
  const compressedPerc = limitDecimalPlaces(String(100 - firstOutcomePerc), 2)

  let xValue
  let currentPrediction
  if (isScalar && market.scalarLow && market.scalarHigh) {
    currentPrediction = market.outcomeTokenMarginalPrices[1]
    xValue =
      Number(currentPrediction) * 100 > 100
        ? 100
        : Number(currentPrediction) * 100 < 0
        ? 0
        : Number(currentPrediction) * 100
  }

  return (
    <StyledMarketCard active={active} onClick={onClick}>
      <ClosingWrapper>
        <TYPE.bodyRegular color="text2">Closing {resolutionDate}</TYPE.bodyRegular>
        <RadioWrapper selected={active}>{active && <Tick />}</RadioWrapper>
      </ClosingWrapper>
      <TitleWrapper>
        <TYPE.bodyMedium color="text1">{market.title}</TYPE.bodyMedium>
      </TitleWrapper>
      {isScalar ? (
        <ScaleWrapper>
          <PercWrapper>
            <TYPE.bodyRegular color="text2" marginLeft={16}>
              0%
            </TYPE.bodyRegular>
            <TYPE.bodyRegular color="text2" marginRight={16}>
              1%
            </TYPE.bodyRegular>
          </PercWrapper>
          <Scale>
            <Tooltip id="scale-tooltip" static={true} xValue={xValue}>
              <ScaleTooltipMessage>90.54%</ScaleTooltipMessage>
            </Tooltip>
            <ScaleDot positive={undefined} xValue={Number(market.outcomeTokenMarginalPrices[1])} />
            <HorizontalBarChange color="primary4" height={1} start={0} width={1} />
          </Scale>
        </ScaleWrapper>
      ) : (
        <OutcomeWrapper>
          <OutcomeRow>
            <TYPE.bodyRegular color="text2">{firstOutcome}</TYPE.bodyRegular>
            <TYPE.bodyMedium color="text2">{firstOutcomePerc}%</TYPE.bodyMedium>
          </OutcomeRow>
          <OutcomeRow>
            <TYPE.bodyRegular color="text2">{secondOutcome}</TYPE.bodyRegular>
            <TYPE.bodyMedium color="text2">{compressedPerc}%</TYPE.bodyMedium>
          </OutcomeRow>
        </OutcomeWrapper>
      )}
      <DetailsWrapper>
        <TYPE.bodyRegular color="text2">
          {formattedLiquidity} {market.collateral.symbol} Liquidity
        </TYPE.bodyRegular>
        <TYPE.bodyRegular color="text2">
          {formattedVolume} {market.collateral.symbol} Volume
        </TYPE.bodyRegular>
      </DetailsWrapper>
    </StyledMarketCard>
  )
}
