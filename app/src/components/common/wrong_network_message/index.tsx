import React from 'react'
import { RouteComponentProps } from 'react-router'
import { withRouter } from 'react-router-dom'
import styled, { withTheme } from 'styled-components'

import { networkIds } from '../../../util/networks'
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

const WrongNetworkMessageContainer = () => {
  return (
    <>
      <SectionTitle title="THERE WAS A PROBLEM..." />
      <ViewCard>
        <SubsectionTitle>Wrong network configuration</SubsectionTitle>
        <WrappedText>We couldn&apos;t find the network with the provided wallet configuration.</WrappedText>
        <WrappedText>
          The valid networks to use are{' '}
          <strong>
            {Object.keys(networkIds)
              .filter((networkLabel: string) => networkLabel !== 'GANACHE')
              .join(', ')
              .toLowerCase()}
          </strong>
          .
        </WrappedText>
        <WrappedText>Please check the network configuration in your wallet and come back again.</WrappedText>
        <ButtonContainer>
          <ButtonLinkStyled onClick={() => window.location.reload(false)}>Reload</ButtonLinkStyled>
        </ButtonContainer>
      </ViewCard>
    </>
  )
}

export const WrongNetworkMessage = withRouter(withTheme(WrongNetworkMessageContainer))
