import { BigNumber, bigNumberify } from 'ethers/utils'
import React, { useState } from 'react'
import styled from 'styled-components'

import { TYPE } from '../../theme'
import { Card } from '../common/card'
import { Table } from '../common/card/responsive_cards/table'
import { FormStateButton } from '../common/form/form_state_button'
import { IconArrowBack, IconArrowRight, IconOmen } from '../common/icons'
import { RoundTag } from '../common/tag/round_tag'
import { SectionTitle, SectionTitleWrapper } from '../common/text/section_title'
import { MarketScale } from '../market/common_sections/card_bottom_details/market_scale'
import { ViewCard } from '../market/common_sections/view_card'
import ModalTitle from '../modal/modal_title'

const MainWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  column-gap: 48px;
  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    flex-direction: column;
  }
`
const MainSection = styled(Card)`
  width: 73%;
  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    width: 100%;
  }
`
const VoteSection = styled(Card)`
  width: 27%;
  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
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
              style={{ marginTop: '24px' }}
              unit={'%'}
              upperBound={bigNumberify('100000000000000000000')}
            ></MarketScale>
          ) : (
            <RoundTag>Cufta</RoundTag>
          )}
          <Table valueObject={secondObject} />
        </MainSection>
        <VoteSection>
          <TYPE.heading1>vote</TYPE.heading1>
        </VoteSection>
      </MainWrapper>
    </Container>
  )
}
