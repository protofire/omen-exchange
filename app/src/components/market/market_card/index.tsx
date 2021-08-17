import moment from 'moment'
import React from 'react'
import styled from 'styled-components'

import { bigNumberToNumber, formatToShortNumber, limitDecimalPlaces } from '../../../util/tools'
import { MarketMakerDataItem } from '../../../util/types'
import { CurationRadioWrapper } from '../common_styled'

const ClosingWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`

const Closing = styled.div`
  font-size: 14px;
  font-weight: 400;
  line-height: 18px;
  color: #86909e;
`

const Title = styled.div`
  font-size: 14px;
  font-weight: 500;
  line-height: 18px;
  margin-bottom: 16px;
  color: #37474f;
`

const StyledMarketCard = styled.div<{ active?: boolean }>`
  flex-basis: calc(33.33% - 20px);
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

const DetailsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`

const Detail = styled.div`
  color: ${props => props.theme.colors.textColorLighter};
`

const OutcomeWrapper = styled.div`
  border: 1px solid ${props => props.theme.colors.verticalDivider};
  box-sizing: border-box;
  border-radius: 8px;
  margin-bottom: 16px;
`

const OutcomeRow = styled.div<{ border?: boolean }>`
  padding: 10px 16px;
  display: flex;
  justify-content: space-between;

  &:last-child {
    border-top: 1px solid ${props => props.theme.colors.verticalDivider};
  }
`

const OutcomeItem = styled.div`
  color: ${props => props.theme.colors.textColorLighter};
  font-weight: 400;

  &:last-child {
    font-weight: 500;
  }
`

interface Props {
  active: boolean
  market: MarketMakerDataItem
  onClick?: () => void
}

export const MarketCard = (props: Props) => {
  const { active, market, onClick } = props

  const resolutionDate = moment(market.openingTimestamp).format('Do MMMM YYYY')
  const formattedLiquidity: string = formatToShortNumber(
    bigNumberToNumber(market.totalPoolShares, market.collateral.decimals),
  )
  const formattedVolume: string = formatToShortNumber(
    bigNumberToNumber(market.collateralVolume, market.collateral.decimals),
  )

  return (
    <StyledMarketCard active={active} onClick={onClick}>
      <ClosingWrapper>
        <Closing>Closing {resolutionDate}</Closing>
        <RadioWrapper selected={active}>{active && <Tick />}</RadioWrapper>
      </ClosingWrapper>
      <Title>{market.title}</Title>
      <OutcomeWrapper>
        {market.outcomes?.map((outcome, index) => (
          <OutcomeRow key={outcome}>
            <OutcomeItem>{outcome}</OutcomeItem>
            <OutcomeItem>{limitDecimalPlaces(market.outcomeTokenMarginalPrices[index], 2)}%</OutcomeItem>
          </OutcomeRow>
        ))}
      </OutcomeWrapper>
      <DetailsWrapper>
        <Detail>
          {formattedLiquidity} {market.collateral.symbol} Liquidity
        </Detail>
        <Detail>
          {formattedVolume} {market.collateral.symbol} Volume
        </Detail>
      </DetailsWrapper>
    </StyledMarketCard>
  )
}
