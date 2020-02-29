import React from 'react'
import { RouteComponentProps } from 'react-router'
import { withRouter } from 'react-router-dom'
import styled, { withTheme } from 'styled-components'

import { ButtonContainer } from '../button_container'
import { ButtonLink } from '../button_link'
import { SectionTitle } from '../section_title'
import { SubsectionTitle } from '../subsection_title'
import { ViewCard } from '../view_card'

const WrappedText = styled.div`
  font-family: Roboto;
  font-size: 14px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.36;
  letter-spacing: normal;
  text-align: left;
  color: #555555;
  margin-top: 20px;
  margin-bottom: 10px;
`

const ButtonLinkStyled = styled(ButtonLink)`
  margin-right: auto;
`

interface Props extends RouteComponentProps<{}> {
  theme?: any
}

const MarketNotFoundWrapper = (props: Props) => {
  return (
    <>
      <SectionTitle title="THERE WAS A PROBLEM..." />
      <ViewCard>
        <SubsectionTitle>Market Not Found</SubsectionTitle>
        <WrappedText>We couldn`&apos;t find the market with the provided address.</WrappedText>
        <WrappedText>Please check the URL and address and come back again.</WrappedText>
        <ButtonContainer>
          <ButtonLinkStyled onClick={() => props.history.push(`/`)}>‹ Home</ButtonLinkStyled>
        </ButtonContainer>
      </ViewCard>
    </>
  )
}

export const MarketNotFound = withRouter(withTheme(MarketNotFoundWrapper))
