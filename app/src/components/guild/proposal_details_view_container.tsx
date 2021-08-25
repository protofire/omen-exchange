import { BigNumber, bigNumberify } from 'ethers/utils'
import React from 'react'
import styled from 'styled-components'

import { TYPE } from '../../theme'
import { getArbitrator, getToken } from '../../util/networks'
import { KlerosSubmission } from '../../util/types'
import { Button } from '../button/button'
import { ButtonType } from '../button/button_styling_types'
import { Card } from '../common/card'
import { Table } from '../common/card/responsive_cards/table'
import { IconArrowBack, IconOmen } from '../common/icons'
import { ResponsiveTableSimple } from '../common/table/responsive_table_simple'
import { BarDiagram } from '../market/common_sections/card_bottom_details/bar_diagram_probabilities'
import { MarketScale } from '../market/common_sections/card_bottom_details/market_scale'
import { AdditionalMarketData } from '../market/common_sections/card_top_details/additional_market_data'

const MainWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  column-gap: 48px;
  @media (max-width: ${props => props.theme.themeBreakPoints.xl}) {
    flex-direction: column;
  }
`
const MainSection = styled(Card)`
  width: 73%;
  @media (max-width: ${props => props.theme.themeBreakPoints.xl}) {
    width: 100%;
  }
`
const VoteSection = styled(Card)`
  width: 27%;
  padding: 20px 24px;
  height: fit-content;
  @media (max-width: ${props => props.theme.themeBreakPoints.xl}) {
    width: 100%;
    padding: 20px;
    margin-top: 24px;
  }
`
const NavigationSection = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
  @media (max-width: ${props => props.theme.themeBreakPoints.xl}) {
    flex-direction: column;
  }
`
const Container = styled.div`
  flex-direction: row;
  width: 100%;
  padding: 0;
`

const VotesBar = styled.div`
  margin: 16px 0;
  row-gap: 16px;
  display: flex;
  flex-direction: column;
`
const VoteButtons = styled.div`
  border-top: 1px solid #e8eaf6;
  margin: 0 -24px;
  padding: 20px 24px 0;
  flex-direction: row;
  display: flex;
  justify-content: space-between;
  column-gap: 16px;
  @media (max-width: ${props => props.theme.themeBreakPoints.xl}) {
    margin: 0 -20px;
    padding: 20px 20px 0;
  }
  button {
    flex: 1;
  }
`
const MarketStatus = styled.div`
  display: flex;
  align-items: center;
  @media (max-width: ${props => props.theme.themeBreakPoints.xl}) {
    justify-content: space-between;
    margin-top: 16px;
  }
`
const StateButton = styled.div`
  border: 1px solid #4b9e98;
  padding: 9px 14px;
  width: fit-content;
  border-radius: 6px;
  margin-left: 16px;
  @media (max-width: ${props => props.theme.themeBreakPoints.xl}) {
    padding: 5px 9px;
  }
`

const BackNavigation = styled.div`
  display: flex;
  align-items: center;
`

const Heading = styled(TYPE.heading2)`
  border-bottom: ${props => props.theme.borders.borderLineDisabled};
  color: ${props => props.theme.text3};
  margin: 0 -24px;
  padding: 0 24px 20px;
`
const MarketDetails = styled(TYPE.bodyRegular)`
  color: ${props => props.theme.text2};
  margin-top: 32px;
  @media (max-width: ${props => props.theme.themeBreakPoints.xl}) {
    margin-top: 24px;
  }
`
const OutcomeStyleWrapper = styled.div`
  margin-top: 32px;
  @media (max-width: ${props => props.theme.themeBreakPoints.xl}) {
    margin-top: 16px;
  }
`
const StyledTable = styled(Table)`
  margin-top: 32px;

  @media (max-width: ${props => props.theme.themeBreakPoints.xl}) {
    margin-top: 24px;
  }
`
const AdditionalDataWrapper = styled(AdditionalMarketData)`
  border: none;
  margin-left: -20px;

  div:first-child {
    padding-top: 32px;
  }
  a {
    margin-bottom: 12px;
  }
  @media (max-width: ${props => props.theme.themeBreakPoints.xl}) {
    div:first-child {
      padding-top: 16px;
      padding-bottom: 4px;
    }
    a {
      margin-bottom: -4px !important;
    }
  }
`
const VoteHeading = styled(TYPE.heading2)`
  padding: 0 24px 20px;
  margin: 0 -24px;
  border-bottom: 1px solid #e8eaf6;
  color: ${props => props.theme.text3};
  @media (max-width: ${props => props.theme.themeBreakPoints.xl}) {
    padding: 0 20px 20px;
    margin: 0 -20px;
  }
`

const BarDiagramStyled = styled(BarDiagram)`
  border-top: ${props => props.theme.borders.borderLineDisabled};
  margin: 0 -24px;
  padding: 20px 24px 0px;
  @media (max-width: ${props => props.theme.themeBreakPoints.xl}) {
    margin: 0 -20px;
  }
`
const MarketStatusText = styled(TYPE.bodyMedium)`
  color: ${props => props.theme.profit};
`

interface Props {
  amount: any
  apy: any
  duration: any
  marketDetails: any
  scaleValue: any
  liqudiity: any
  totalVolume: any
  volume: any
  closingDate: any
  closingIn: any
  apyTwo: any
  verified: any
  isScalar: any
  setIsScalar: any
}
export const ProposalDetailsView: React.FC<Props> = (props: Props) => {
  const {
    amount,
    apy,
    closingDate,
    closingIn,
    duration,
    isScalar,
    liqudiity,
    marketDetails,
    scaleValue,
    setIsScalar,
    totalVolume,
    volume,
  } = props

  const object = [
    ['Rewards', { text: amount, icon: <IconOmen /> }],
    ['APY%', { text: apy }],
    ['Duration', { text: duration }],
  ]
  const secondObject = [
    ['Liqudity', { text: liqudiity }],
    ['Total Volume', { text: totalVolume }],
    ['24h Volume', { text: volume }],
    ['Closing', { text: closingDate }],
    ['Closing in', { text: closingIn }],
  ]
  const Outcomes = [
    ['Violet', 22],
    ['Nasdd', 43],
    ['Drkso', 33],
    ['Sfhrs', 55],
    ['Uno more', 78],
    // ['Uno more', 78],
  ]
  const submissions: KlerosSubmission[] = []
  return (
    <Container>
      <NavigationSection>
        <BackNavigation>
          <IconArrowBack color={'primary2'}></IconArrowBack>
          <TYPE.heading3 color={'primary2'} marginLeft={'12px'}>
            Guild Overview
          </TYPE.heading3>
        </BackNavigation>
        <MarketStatus>
          <MarketStatusText>5 days, 54 mins left</MarketStatusText>
          <StateButton>
            <MarketStatusText>Active</MarketStatusText>
          </StateButton>
        </MarketStatus>
      </NavigationSection>
      <MainWrapper>
        <MainSection>
          <Heading>Issue Liqudity Rewards</Heading>
          <StyledTable valueObject={object} />
          <MarketDetails
            onClick={() => {
              setIsScalar(!isScalar)
            }}
          >
            Market Details
          </MarketDetails>
          <TYPE.heading3 color={'text3'} marginTop={'12px'}>
            {marketDetails}
          </TYPE.heading3>
          <OutcomeStyleWrapper>
            {isScalar ? (
              <MarketScale
                currentPrediction={scaleValue}
                lowerBound={new BigNumber(0)}
                startingPointTitle={'Current'}
                style={{ border: 'none' }}
                unit={'%'}
                upperBound={bigNumberify('100000000000000000000')}
              ></MarketScale>
            ) : (
              <ResponsiveTableSimple outcomes={Outcomes} />
            )}
          </OutcomeStyleWrapper>

          <StyledTable valueObject={secondObject} />
          <AdditionalDataWrapper
            address={'42'}
            arbitrator={getArbitrator(100, 'dxdao')}
            category={'Politics'}
            collateral={getToken(1, 'dai')}
            curatedByDxDao={true}
            curatedByDxDaoOrKleros={true}
            id={'111'}
            oracle={'DxDao'}
            ovmAddress={'22554'}
            submissionIDs={submissions}
            title={'hell'}
          />
        </MainSection>
        <VoteSection>
          <VoteHeading>Vote</VoteHeading>
          <VotesBar>
            <BarDiagram
              additionalTextLeft={'454 votes'}
              additionalTextRight={'454 OMEN'}
              outcomeIndex={22}
              outcomeName={'Yes'}
              probability={22}
            />
            <BarDiagramStyled
              additionalTextLeft={'454 votes'}
              additionalTextRight={'454 OMEN'}
              outcomeIndex={22}
              outcomeName={'No'}
              probability={42}
            />
          </VotesBar>
          <VoteButtons>
            <Button buttonType={ButtonType.primary}>Yes</Button>
            <Button buttonType={ButtonType.primary}>No</Button>
          </VoteButtons>
        </VoteSection>
      </MainWrapper>
    </Container>
  )
}
