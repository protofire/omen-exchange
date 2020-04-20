import React from 'react'
import styled from 'styled-components'

import { DISCLAIMER_TEXT } from '../../../common/constants'

const Wrapper = styled.div`
  align-items: center;
  border-top: 1px solid ${props => props.theme.borders.borderColor};
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin: 20px auto 0;
  max-width: 100%;
  padding: 10px 10px 0;
  width: ${props => props.theme.mainContainer.maxWidth};
`

const Text = styled.span`
  color: ${props => props.theme.colors.textColor};
  font-size: 10px;
  font-weight: 400;
  text-align: center;
`

const Title = styled(Text)`
  font-weight: 500;
  text-transform: uppercase;
`

export const Disclaimer = () => {
  return DISCLAIMER_TEXT ? (
    <Wrapper>
      <Text>
        <Title>Disclaimer:</Title> {DISCLAIMER_TEXT}
      </Text>
    </Wrapper>
  ) : null
}
