import React, { DOMAttributes, HTMLAttributes } from 'react'
import styled from 'styled-components'

import { ButtonStateful, ButtonStates } from '../../../button/button_stateful'

const Wrapper = styled.div`
  border-radius: 4px;
  border: ${({ theme }) => theme.borders.borderLineDisabled};
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
  display: inline-block;
`

export type WrapERC1155Props = DOMAttributes<HTMLDivElement> &
  HTMLAttributes<HTMLDivElement> & {
    marginBottom?: boolean
    finished?: boolean
    loading?: boolean
    onWrap: () => void
  }

export const WrapERC1155: React.FC<WrapERC1155Props> = (props: WrapERC1155Props) => {
  const { finished, loading, onWrap, ...restProps } = props

  const state = loading ? ButtonStates.working : finished ? ButtonStates.finished : ButtonStates.idle

  return (
    <Wrapper {...restProps}>
      <Title>Upgrade ERC1155</Title>
      <DescriptionWrapper>
        <Description>
          The market has been upgraded to use ERC20 tokens, but your position is still represented using ERC1155 tokens,
          please upgrade to continue.
        </Description>
        <ButtonStateful disabled={loading || finished} onClick={onWrap} state={state}>
          Upgrade
        </ButtonStateful>
      </DescriptionWrapper>
    </Wrapper>
  )
}
