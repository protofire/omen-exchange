import React, { useState } from 'react'
import styled from 'styled-components'

import { Card } from '../../common/card'
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

const StyledMarketCard = styled(Card)<{ selected?: boolean }>`
  flex-basis: calc(33.33% - 20px);
  border-color: ${props => (props.selected ? props.theme.colors.borderColorDark : props.theme.colors.tertiary)};
  padding: 28px 24px;
  margin-top: 20px;

  &:hover {
    border-color: ${props => (props.selected ? props.theme.colors.borderColorDark : '#D2D6ED')};
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

export const MarketCard = () => {
  const [selected, setSelected] = useState(false)
  return (
    <StyledMarketCard onClick={() => setSelected(!selected)} selected={selected}>
      <ClosingWrapper>
        <Closing>Closing 1st September 2021</Closing>
        <RadioWrapper selected={selected}>{selected && <Tick />}</RadioWrapper>
      </ClosingWrapper>
      <Title>
        Will the Summer Olympics be completed successfully in Tokyo in 2021 with all planned events taking place before
        the end of August 2021?
      </Title>
      <OutcomeWrapper>
        <OutcomeRow>
          <OutcomeItem>Yes</OutcomeItem>
          <OutcomeItem>67.55%</OutcomeItem>
        </OutcomeRow>
        <OutcomeRow>
          <OutcomeItem>No</OutcomeItem>
          <OutcomeItem>32.45%</OutcomeItem>
        </OutcomeRow>
      </OutcomeWrapper>
      <DetailsWrapper>
        <Detail>3,534 DAI Liquidity</Detail>
        <Detail>500 DAI Volume</Detail>
      </DetailsWrapper>
    </StyledMarketCard>
  )
}
