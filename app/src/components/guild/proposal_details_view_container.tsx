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
import { RoundTag } from '../common/tag/round_tag'
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
  padding: 20px;
  height: fit-content;
  @media (max-width: ${props => props.theme.themeBreakPoints.xl}) {
    width: 100%;
    margin-top: 24px;
  }
`
const NavigationSection = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`
const Container = styled.div`
  flex-direction: row;
  width: 100%;
  padding: 0;
`
const AdditionalData = styled(AdditionalMarketData)`
  border: none;
  margin-top: 10px;
`
const VotesBar = styled.div`
  margin: 16px 0;
  row-gap: 16px;
  display: flex;
  flex-direction: column;
`
const VoteButtons = styled.div`
  border-top: 1px solid #e8eaf6;
  margin: 0 -20px;
  padding: 20px 20px 0;
  flex-direction: row;
  display: flex;
  justify-content: space-between;
  column-gap: 16px;
  button {
    flex: 1;
  }
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
    apyTwo,
    closingDate,
    closingIn,
    duration,
    isScalar,

    liqudiity,
    marketDetails,
    scaleValue,
    setIsScalar,

    totalVolume,
    verified,
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
  const submissions: KlerosSubmission[] = []
  return (
    <Container>
      <NavigationSection>
        <div style={{ display: 'flex' }}>
          {/* can it be reused*/} <IconArrowBack></IconArrowBack>
          <TYPE.heading3>Milan</TYPE.heading3>
        </div>
        <div>SOme other text</div>
      </NavigationSection>
      <MainWrapper>
        <MainSection>
          <TYPE.heading2 borderBottom={'1px solid #E8EAF6'} margin={'0 -24px'} padding={'0 24px 20px'}>
            Issue Liqudity Rewards
          </TYPE.heading2>
          <Table valueObject={object} />
          <TYPE.bodyRegular
            color={'text2'}
            marginTop={'24px'}
            onClick={() => {
              setIsScalar(!isScalar)
            }}
          >
            Market Details
          </TYPE.bodyRegular>
          <TYPE.heading3 color={'text3'} marginTop={'16px'}>
            {marketDetails}
          </TYPE.heading3>
          {isScalar ? (
            <MarketScale
              currentPrediction={scaleValue}
              lowerBound={new BigNumber(0)}
              startingPointTitle={'Current'}
              style={{ marginTop: '24px', border: 'none' }}
              unit={'%'}
              upperBound={bigNumberify('100000000000000000000')}
            ></MarketScale>
          ) : (
            <RoundTag>Cufta</RoundTag>
          )}
          <Table valueObject={secondObject} />
          <AdditionalData
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
          <TYPE.heading2 borderBottom={'1px solid #E8EAF6'} color={'text3'} margin={'0 -20px'} padding={'0 20px 20px'}>
            Vote
          </TYPE.heading2>
          <VotesBar>
            <BarDiagram
              additionalTextLeft={'454 votes'}
              additionalTextRight={'454 OMEN'}
              outcomeIndex={22}
              outcomeName={'Yes'}
              probability={22}
            />
            <BarDiagram
              additionalTextLeft={'454 votes'}
              additionalTextRight={'454 OMEN'}
              outcomeIndex={22}
              outcomeName={'No'}
              probability={42}
              style={{ borderTop: '1px solid #E8EAF6', margin: '0 -20px', padding: '20px 20px 0px' }}
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
