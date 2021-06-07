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
    border-color: ${props => props.theme.buttonPrimaryLine.borderColorDisabled};
    color: ${props => props.theme.buttonPrimaryLine.color};
    opacity: 1;
  }
`

const IdleDisabledCSS = css`
  &[disabled],
  &[disabled]:hover {
    background-color: ${props => props.theme.buttonPrimary.backgroundColor};
    border-color: ${props => props.theme.buttonPrimary.borderColor};
    color: ${props => props.theme.buttonPrimary.color};
    opacity: 0.5;
  }
`
const SuccessCSS = css`
  border: 1px solid ${props => props.theme.colors.green} !important;
  color: ${props => props.theme.colors.green} !important;
  opacity: 1 !important;
`

const Wrapper = styled.button<ButtonStatefulProps>`
  ${ButtonCSS};
  position: relative;
  ${props =>
    props.state === ButtonStates.idle
      ? IdleDisabledCSS
      : props.state === ButtonStates.finished && props.extraText
      ? SuccessCSS
      : DisabledCSS};
`

const Text = styled.span<{ hide: boolean; state: ButtonStates }>`
  display: ${props => (props.hide ? 'none' : 'flex')};
  position: relative;
  user-select: none;
  z-index: 1;
  ${props => props.state === ButtonStates.idle && `font-weight:${props.theme.buttonSecondary.weight}`};
`

const SVGWrapper = styled.span<{ marginLeft?: boolean }>`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  margin-left: ${props => (props.marginLeft ? '10px' : '')};
  z-index: 5;
`

const Spinner = styled.img`
  animation: ${rotate} 1s linear infinite;
`

const Check = styled.img``

interface ButtonStatefulProps extends ButtonProps {
  state?: ButtonStates
  extraText?: boolean
}

export const ButtonStateful: React.FC<ButtonStatefulProps> = (props: ButtonStatefulProps) => {
  const { extraText = false, children, disabled, onClick, state = ButtonStates.idle, ...restProps } = props

  return (
    <Wrapper
      buttonType={state === ButtonStates.idle ? ButtonType.primary : ButtonType.primaryLine}
      disabled={disabled || state === ButtonStates.working}
      extraText={extraText}
      onClick={onClick}
      state={state}
      {...restProps}
    >
      <Text hide={state !== ButtonStates.idle && !extraText} state={state}>
        {children}
      </Text>
      {state === ButtonStates.working && (
        <SVGWrapper marginLeft={extraText}>
          <Spinner alt="" src={SpinnerSVG} />
        </SVGWrapper>
      )}
      {state === ButtonStates.finished && !extraText && (
        <SVGWrapper>
          <Check alt="" src={CheckSVG} />
        </SVGWrapper>
      )}
    </Wrapper>
  )
}
