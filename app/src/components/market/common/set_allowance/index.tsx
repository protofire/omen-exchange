import React, { DOMAttributes, HTMLAttributes } from 'react'
import styled from 'styled-components'

import { Token } from '../../../../util/types'
import { ToggleTokenLock, ToggleTokenLockProps } from '../toggle_token_lock'

const Wrapper = styled.div`
  border-radius: 4px;
  border: 1px solid ${props => props.theme.borders.borderDisabled};
  padding: 21px 25px;
`

const Title = styled.h2`
  color: ${props => props.theme.colors.textColorDark};
  font-size: 16px;
  letter-spacing: 0.4px;
  line-height: 1.2;
  margin: 0 0 20px;
  font-weight: 400;
`

const DescriptionWrapper = styled.div`
  align-items: center;
  display: flex;
`

const Description = styled.p`
  color: ${props => props.theme.colors.textColorLightish};
  font-size: 14px;
  letter-spacing: 0.2px;
  line-height: 1.4;
  margin: 0 32px 0 0;
`

export type SetAllowanceProps = DOMAttributes<HTMLDivElement> &
  HTMLAttributes<HTMLDivElement> &
  ToggleTokenLockProps & {
    collateral: Token
  }

export const SetAllowance: React.FC<SetAllowanceProps> = (props: SetAllowanceProps) => {
  const { collateral, finished, loading, onUnlock, ...restProps } = props

  return (
    <Wrapper {...restProps}>
      <Title>Set Allowance</Title>
      <DescriptionWrapper>
        <Description>
          This permission allows the smart contracts to interact with your {collateral.symbol}. This has to be done for
          each new token.
        </Description>
        <ToggleTokenLock finished={finished} loading={loading} onUnlock={onUnlock} />
      </DescriptionWrapper>
    </Wrapper>
  )
}
