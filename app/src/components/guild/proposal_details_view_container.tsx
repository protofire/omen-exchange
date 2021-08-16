import React, { useState } from 'react'
import styled from 'styled-components'

import { TYPE } from '../../theme'
import { Card } from '../common/card'
import { SectionTitle, SectionTitleWrapper } from '../common/text/section_title'
import { ViewCard } from '../market/common_sections/view_card'
import ModalTitle from '../modal/modal_title'

const MainWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
`
const MainSection = styled(Card)`
  width: 75%;
`
const VoteSection = styled(Card)`
  width: 25%;
`
const NavigationSection = styled.div`
  width: 100%;
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
  return (
    <Container>
      <NavigationSection>
        <TYPE.heading1>Milan</TYPE.heading1>
      </NavigationSection>
      <MainWrapper>
        <MainSection>
          <TYPE.heading2>Issue Liqudity Rewards</TYPE.heading2>
        </MainSection>
        <VoteSection>
          <TYPE.heading1>vote</TYPE.heading1>
        </VoteSection>
      </MainWrapper>
    </Container>
  )
}
