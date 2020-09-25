import React from 'react'
import { RouteComponentProps } from 'react-router'
import { withRouter } from 'react-router-dom'
import styled, { withTheme } from 'styled-components'

import { ButtonContainer, ButtonLink } from '../../../button'
import { SectionTitle, SubsectionTitle } from '../../../common'
import { ViewCard } from '../../common/view_card'

const WrappedText = styled.div`
  color: #555;
  font-size: 14px;
  font-stretch: normal;
  font-style: normal;
  font-weight: normal;
  letter-spacing: normal;
  line-height: 1.36;
  margin-bottom: 10px;
  margin-top: 20px;
  text-align: left;
`

const ButtonLinkStyled = styled(ButtonLink)`
  margin-right: auto;
`

interface Props extends RouteComponentProps<Record<string, string | undefined>> {
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
