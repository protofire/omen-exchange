import React from 'react'
import { withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { networkIds } from '../../../util/networks'
import { ButtonContainer, ButtonLink } from '../../button'
import { ViewCard } from '../../market/common/view_card'
import { SectionTitle } from '../text/section_title'
import { SubsectionTitle } from '../text/subsection_title'

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

export const WrongNetworkMessage = withRouter(WrongNetworkMessageContainer)
