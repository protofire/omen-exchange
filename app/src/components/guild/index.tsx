import React, { useState } from 'react'
import styled from 'styled-components'

import { RemoteData } from '../../util/remote_data'
import { MarketFilters, MarketMakerDataItem } from '../../util/types'
import { Button } from '../button'
import { ButtonType } from '../button/button_styling_types'
import { MarketCard } from '../market/market_card'

interface Props {
  count: number
  currentFilter: any
  isFiltering?: boolean
  fetchMyMarkets: boolean
  markets: RemoteData<MarketMakerDataItem[]>
  moreMarkets: boolean
  pageIndex: number
  onFilterChange: (filter: MarketFilters) => void
  onLoadNextPage: () => void
  onLoadPrevPage: () => void
}

const GuildPageWrapper = styled.div`
  width: 100%;
  @media (max-width: ${props => props.theme.themeBreakPoints.xxl}) {
    padding: 0 14px;
  }
`

const ProposalHeadingWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
  flex-wrap: wrap;
`

const ProposalTitle = styled.div`
  font-size: 22px;
  font-weight: 500;
  line-height: 26px;
  margin-bottom: 8px;
  color: ${props => props.theme.text3};
`

const ProposalSubtitle = styled.div`
  font-size: 14px;
  font-weight: 400;
  line-height: 18px;
  color: #86909e;
`

const ProposalButton = styled(Button)`
  @media (max-width: ${props => props.theme.themeBreakPoints.sm}) {
    margin-top: 24px;
  }
`

const MarketCardsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  width: 100%;
  margin: 20px 0px;
`

const OverviewWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;

  &:hover svg {
    path {
      fill: ${props => props.theme.primary1};
    }
  }

  &:hover div {
    color: ${props => props.theme.primary1};
  }
`

const IconBack = () => (
  <svg fill="none" height="12" viewBox="0 0 18 12" width="18" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 5H3.83L7.41 1.41L6 0L0 6L6 12L7.41 10.59L3.83 7H18V5Z" />
  </svg>
)

const StyledSvg = styled.svg`
  height: 12px;
  width: 18px;
  cursor: pointer;
  path {
    fill: ${props => props.theme.primary2};
  }
`

const OverviewTitle = styled.div`
  font-family: Roboto;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
  display: flex;
  align-items: center;
  letter-spacing: 0.2px;
  margin-left: 16px;
  cursor: pointer;
  color: ${props => props.theme.primary2};
`

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`

const ButtonNavWrapper = styled.div`
  display: flex;
`

const NextButton = styled(Button)`
  margin-left: 12px;
`

const GuildWrapper = (props: Props) => {
  const { count, isFiltering, markets, moreMarkets } = props
  const [propose, setPropose] = useState(false)
  const [selected, setSelected] = useState<string[]>([])

  const toggle = () => setPropose(!propose)

  const select = (address: string) => {
    if (selected.includes(address)) {
      setSelected(selected.filter((addr: string) => addr !== address))
    } else {
      setSelected([...selected, address])
    }
  }

  return (
    <GuildPageWrapper>
      <ProposalHeadingWrapper>
        {propose ? (
          <div>
            <OverviewWrapper onClick={toggle}>
              <StyledSvg>
                <IconBack />
              </StyledSvg>
              <OverviewTitle>Guild Overview</OverviewTitle>
            </OverviewWrapper>
            <ProposalTitle>Choose Market for liquidity rewards</ProposalTitle>
          </div>
        ) : (
          <div>
            <ProposalTitle>Proposed Liquidity Rewards</ProposalTitle>
            <ProposalSubtitle>Reward liquidity providers of popular omen markets with 500 OMN tokens</ProposalSubtitle>
          </div>
        )}
        <ProposalButton buttonType={ButtonType.primary} disabled={propose && !selected.length} onClick={toggle}>
          Propose Liq. Rewards
        </ProposalButton>
      </ProposalHeadingWrapper>
      {propose && (
        <MarketCardsWrapper>
          {!isFiltering &&
            RemoteData.hasData(markets) &&
            RemoteData.is.success(markets) &&
            markets.data.length > 0 &&
            markets.data.slice(0, count).map(item => {
              return (
                <MarketCard
                  active={selected.includes(item.address)}
                  key={item.address}
                  market={item}
                  onClick={() => select(item.address)}
                />
              )
            })}
        </MarketCardsWrapper>
      )}
      {propose && (
        <ButtonWrapper>
          <Button onClick={toggle}>Back</Button>
          <ButtonNavWrapper>
            <Button>Prev</Button>
            <NextButton buttonType={ButtonType.primary} disabled={!moreMarkets}>
              Next
            </NextButton>
          </ButtonNavWrapper>
        </ButtonWrapper>
      )}
    </GuildPageWrapper>
  )
}

export { GuildWrapper }
