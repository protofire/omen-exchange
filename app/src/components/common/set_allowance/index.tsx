import React from 'react'
import styled from 'styled-components'

import { ButtonType } from '../../../theme/component_styles/button_styling_types'
import { Button } from '../../common'

const Wrapper = styled.div``

const Title = styled.h2`
  color: ${props => props.theme.colors.textColorDarker};
  font-size: 16px;
  letter-spacing: 0.4px;
  line-height: 1.2;
  margin: 0 0 20px;
`

const DescriptionWrapper = styled.div`
  align-items: center;
  border-radius: 4px;
  border: 1px solid ${props => props.theme.borders.borderColorLighter};
  display: flex;
  padding: 21px 25px;
`

const Description = styled.p`
  color: ${props => props.theme.colors.textColorLightish};
  font-size: 14px;
  letter-spacing: 0.2px;
  line-height: 1.4;
  margin: 0 25px 0 0;
`

export const SetAllowance: React.FC = props => {
  const { ...restProps } = props

  return (
    <Wrapper {...restProps}>
      <Title>Set Allowance</Title>
      <DescriptionWrapper>
        <Description>
          This permission allows Omen smart contracts to interact with your DAI. This has to bedone for each new token.
        </Description>
        <Button buttonType={ButtonType.primary}>Set</Button>
      </DescriptionWrapper>
    </Wrapper>
  )
}
