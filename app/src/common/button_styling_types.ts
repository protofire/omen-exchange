import { ReactNode } from 'react'
import { css } from 'styled-components'
import { darken } from 'polished'

export enum ButtonType {
  primaryLine,
  primary,
  secondary,
}

export interface ButtonProps {
  buttonType?: ButtonType
}

export interface ButtonComponentProps {
  buttonType?: ButtonType
  children?: ReactNode
  onClick?: (e?: any) => void
}

const DisabledCSS = css`
  &[disabled] {
    cursor: not-allowed;
    opacity: 0.5;
  }
`

const PrimaryLineCSS = css`
  &,
  &.disabled,
  &.disabled:hover,
  &[disabled],
  &[disabled]:hover {
    background-color: #fff;
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
  }

  &:hover {
    background-color: ${props => props.theme.colors.primary};
    color: #fff;
  }
`

const PrimaryCSS = css<ButtonProps>`
  &,
  &.disabled,
  &.disabled:hover,
  &[disabled],
  &[disabled]:hover {
    background-color: ${props =>
      props.buttonType && props.theme.colors[ButtonType[props.buttonType]]};
    border-color: ${props => props.buttonType && props.theme.colors[ButtonType[props.buttonType]]};
    color: #fff;
  }

  &:hover {
    background-color: ${props =>
      props.buttonType && darken(0.1, props.theme.colors[ButtonType[props.buttonType]])};
  }
`

const getButtonTypeStyles = (buttonType: ButtonType = ButtonType.primaryLine): any => {
  if (buttonType === ButtonType.primaryLine) {
    return PrimaryLineCSS
  }

  return PrimaryCSS
}

export const ButtonCSS = css<ButtonProps>`
  align-items: center;
  border-radius: 2px;
  border-style: solid;
  border-width: 1px;
  cursor: pointer;
  display: flex;
  font-size: 16px;
  font-weight: 500;
  height: 32px;
  justify-content: center;
  outline: none;
  padding: 0 20px;
  text-align: center;
  text-transform: uppercase;
  transition: all 0.15s ease-out;
  white-space: nowrap;

  ${props => getButtonTypeStyles(props.buttonType)}
  ${DisabledCSS}
`
