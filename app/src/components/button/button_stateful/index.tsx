import React from 'react'
import styled, { css, keyframes } from 'styled-components'

import { ButtonCSS, ButtonProps, ButtonType } from '../button_styling_types'

import CheckSVG from './img/check.svg'
import SpinnerSVG from './img/spinner.svg'

export enum ButtonStates {
  idle,
  working,
  finished,
}

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const DisabledCSS = css`
  &[disabled],
  &[disabled]:hover {
    background-color: ${props => props.theme.buttonPrimaryLine.backgroundColor};
    border-color: ${props => props.theme.buttonPrimaryLine.borderColor};
    color: ${props => props.theme.buttonPrimaryLine.color};
    cursor: not-allowed;
    opacity: 1;
  }
`

const IdleDisabledCSS = css`
  &[disabled],
  &[disabled]:hover {
    background-color: ${props => props.theme.buttonPrimary.backgroundColor};
    border-color: ${props => props.theme.buttonPrimary.borderColor};
    color: ${props => props.theme.buttonPrimary.color};
    cursor: not-allowed;
    opacity: 0.5;
  }
`

const Wrapper = styled.button<ButtonStatefulProps>`
  ${ButtonCSS}
  position: relative;
  ${props => (props.state === ButtonStates.idle ? IdleDisabledCSS : DisabledCSS)};
`

const Text = styled.span<{ hide: boolean }>`
  opacity: ${props => (props.hide ? '0' : '1')};
  position: relative;
  user-select: none;
  z-index: 1;
`

const SVGWrapper = styled.span`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 5;
`

const Spinner = styled.img`
  animation: ${rotate} 1s linear infinite;
`

const Check = styled.img``

interface ButtonStatefulProps extends ButtonProps {
  state?: ButtonStates
}

export const ButtonStateful: React.FC<ButtonStatefulProps> = (props: ButtonStatefulProps) => {
  const { children, disabled, onClick, state = ButtonStates.idle, ...restProps } = props

  return (
    <Wrapper
      buttonType={state === ButtonStates.idle ? ButtonType.primary : ButtonType.primaryLine}
      disabled={disabled || state === ButtonStates.working}
      onClick={onClick}
      state={state}
      {...restProps}
    >
      <Text hide={state !== ButtonStates.idle}>{children}</Text>
      {state === ButtonStates.working && (
        <SVGWrapper>
          <Spinner alt="" src={SpinnerSVG} />
        </SVGWrapper>
      )}
      {state === ButtonStates.finished && (
        <SVGWrapper>
          <Check alt="" src={CheckSVG} />
        </SVGWrapper>
      )}
    </Wrapper>
  )
}
