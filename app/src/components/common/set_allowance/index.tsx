import React, { DOMAttributes } from 'react'
import styled from 'styled-components'

import { ButtonStateful, ButtonStates } from '../button_stateful'

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

export interface SetAllowanceProps extends DOMAttributes<HTMLDivElement> {
  onSetAllowance?: () => void | undefined
  state: ButtonStates
}

export const SetAllowance: React.FC<SetAllowanceProps> = (props: SetAllowanceProps) => {
  const { onSetAllowance, state, ...restProps } = props

  return (
    <Wrapper {...restProps}>
      <Title>Set Allowance</Title>
      <DescriptionWrapper>
        <Description>
          This permission allows Omen smart contracts to interact with your DAI. This has to be done for each new token.
        </Description>
        <ButtonStateful onClick={onSetAllowance} state={state}>
          Set
        </ButtonStateful>
      </DescriptionWrapper>
    </Wrapper>
  )
}
