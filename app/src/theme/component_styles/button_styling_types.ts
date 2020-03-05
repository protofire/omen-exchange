import { ReactNode } from 'react'
import { css } from 'styled-components'

export enum ButtonType {
  primary,
  primaryLine,
  secondary,
  secondaryLine,
}

export interface ButtonProps {
  buttonType?: ButtonType
}

export interface ButtonComponentProps {
  buttonType?: ButtonType
  children?: ReactNode
  onClick?: (e?: any) => void
  tabIndex?: number
  title?: string
}

const DisabledCSS = css`
  &[disabled] {
    cursor: not-allowed;
    opacity: 0.5;
  }
`

const PrimaryCSS = css`
  &,
  &.disabled,
  &.disabled:hover,
  &[disabled],
  &[disabled]:hover {
    background-color: ${props => props.theme.buttonPrimary.backgroundColor};
    border-color: ${props => props.theme.buttonPrimary.borderColor};
    color: ${props => props.theme.buttonPrimary.color};
  }

  &:hover {
    background-color: ${props => props.theme.buttonPrimary.backgroundColorHover};
    border-color: ${props => props.theme.buttonPrimary.borderColorHover};
    color: ${props => props.theme.buttonPrimary.colorHover};
  }
`

const PrimaryLineCSS = css`
  &,
  &.disabled,
  &.disabled:hover,
  &[disabled],
  &[disabled]:hover {
    background-color: ${props => props.theme.buttonPrimaryLine.backgroundColor};
    border-color: ${props => props.theme.buttonPrimaryLine.borderColor};
    color: ${props => props.theme.buttonPrimaryLine.color};
  }

  &:hover {
    background-color: ${props => props.theme.buttonPrimaryLine.backgroundColorHover};
    border-color: ${props => props.theme.buttonPrimaryLine.borderColorHover};
    color: ${props => props.theme.buttonPrimaryLine.colorHover};
  }
`

const SecondaryCSS = css`
  &,
  &.disabled,
  &.disabled:hover,
  &[disabled],
  &[disabled]:hover {
    background-color: ${props => props.theme.buttonSecondary.backgroundColor};
    border-color: ${props => props.theme.buttonSecondary.borderColor};
    color: ${props => props.theme.buttonSecondary.color};
  }

  &:hover {
    background-color: ${props => props.theme.buttonSecondary.backgroundColorHover};
    border-color: ${props => props.theme.buttonSecondary.borderColorHover};
    color: ${props => props.theme.buttonSecondary.colorHover};
  }
`

const SecondaryLineCSS = css`
  &,
  &.disabled,
  &.disabled:hover,
  &[disabled],
  &[disabled]:hover {
    background-color: ${props => props.theme.buttonSecondaryLine.backgroundColor};
    border-color: ${props => props.theme.buttonSecondaryLine.borderColor};
    color: ${props => props.theme.buttonSecondaryLine.color};
  }

  &:hover {
    background-color: ${props => props.theme.buttonSecondaryLine.backgroundColorHover};
    border-color: ${props => props.theme.buttonSecondaryLine.borderColorHover};
    color: ${props => props.theme.buttonSecondaryLine.colorHover};
  }
`

const getButtonTypeStyles = (buttonType: ButtonType = ButtonType.primaryLine): any => {
  if (buttonType === ButtonType.primary) {
    return PrimaryCSS
  }

  if (buttonType === ButtonType.secondary) {
    return SecondaryCSS
  }

  if (buttonType === ButtonType.primaryLine) {
    return PrimaryLineCSS
  }

  if (buttonType === ButtonType.secondaryLine) {
    return SecondaryLineCSS
  }

  return PrimaryCSS
}

export const ButtonCSS = css<ButtonProps>`
  align-items: center;
  border-radius: 32px;
  border-style: solid;
  border-width: 1px;
  cursor: pointer;
  display: flex;
  font-size: 14px;
  font-weight: 400;
  height: 32px;
  justify-content: center;
  letter-spacing: 0.2px;
  line-height: 1.2;
  outline: none;
  padding: 0 20px;
  text-align: center;
  transition: all 0.15s ease-out;
  white-space: nowrap;

  ${props => getButtonTypeStyles(props.buttonType)}
  ${DisabledCSS}
`
