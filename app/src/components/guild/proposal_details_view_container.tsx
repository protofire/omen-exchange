import React, { useState } from 'react'
import styled from 'styled-components'

import { TYPE } from '../../theme'
import { Card } from '../common/card'
import { Table } from '../common/card/responsive_cards/table'
import { IconArrowBack, IconArrowRight, IconOmen } from '../common/icons'
import { SectionTitle, SectionTitleWrapper } from '../common/text/section_title'
import { ViewCard } from '../market/common_sections/view_card'
import ModalTitle from '../modal/modal_title'

const MainWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  column-gap: 48px;
`
const MainSection = styled(Card)`
  width: 73%;
`
const VoteSection = styled(Card)`
  width: 27%;
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
}
export const ProposalDetailsView: React.FC<Props> = (props: Props) => {
  const {
    amount,
    apy,
    apyTwo,
    closingDate,
    closingIn,
    duration,
    liqudiity,
    marketDetails,
    scaleValue,
    totalVolume,
    verified,
    volume,
  } = props

  const object = [
    ['Rewards', { text: amount, icon: <IconOmen /> }],
    ['APY%', { text: apy }],
    ['Duration', { text: duration }],
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
          <TYPE.heading2 borderBottom={'1px solid grey'} margin={'0 -24px'} padding={'0 24px 20px'}>
            Issue Liqudity Rewards
          </TYPE.heading2>
          <Table valueObject={object} />
        </MainSection>
        <VoteSection>
          <TYPE.heading1>vote</TYPE.heading1>
        </VoteSection>
      </MainWrapper>
    </Container>
  )
}
