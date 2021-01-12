import { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'
import { css } from 'styled-components'

export enum ButtonType {
  primary,
  primaryLine,
  secondary,
  secondaryLine,
  primaryAlternative,
}

export interface ButtonCommonProps {
  buttonType?: ButtonType
  theme?: any
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonCommonProps {}

export interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement>, ButtonCommonProps {}

const PrimaryCSS = css`
  & {
    background-color: ${props => props.theme.buttonPrimary.backgroundColor};
    border-color: ${props => props.theme.buttonPrimary.borderColor};
    color: ${props => props.theme.buttonPrimary.color};
  }

  &:hover {
    background-color: ${props => props.theme.buttonPrimary.backgroundColorHover};
    border-color: ${props => props.theme.buttonPrimary.borderColorHover};
    color: ${props => props.theme.buttonPrimary.colorHover};
  }

  &[disabled],
  &[disabled]:hover {
    background-color: ${props => props.theme.buttonPrimary.backgroundColorDisabled};
    border-color: ${props => props.theme.buttonPrimary.borderColorDisabled};
    color: ${props => props.theme.buttonPrimary.colorDisabled};
    cursor: not-allowed;
    opacity: 0.5;
  }
`

const PrimaryLineCSS = css`
  & {
    background-color: ${props => props.theme.buttonPrimaryLine.backgroundColor};
    border-color: ${props => props.theme.buttonPrimaryLine.borderColor};
    color: ${props => props.theme.buttonPrimaryLine.color};
  }

  &:hover {
    background-color: ${props => props.theme.buttonPrimaryLine.backgroundColorHover};
    border-color: ${props => props.theme.buttonPrimaryLine.borderColorHover};
    color: ${props => props.theme.buttonPrimaryLine.colorHover};
  }

  &[disabled],
  &[disabled]:hover {
    background-color: ${props => props.theme.buttonPrimaryLine.backgroundColorDisabled};
    border-color: ${props => props.theme.buttonPrimaryLine.borderColorDisabled};
    color: ${props => props.theme.buttonPrimaryLine.colorDisabled};
    cursor: not-allowed;
    opacity: 0.5;
  }
`

const PrimaryAlternativeCSS = css`
  & {
    border: 1px solid ${props => props.theme.buttonPrimary.borderColorHover};
    background-color: ${props => props.theme.buttonPrimary.backgroundColor};
    color: ${props => props.theme.buttonPrimary.color};
  }

  &[disabled],
  &[disabled]:hover {
    background-color: ${props => props.theme.buttonPrimaryLine.backgroundColorDisabled};
    border-color: ${props => props.theme.buttonPrimaryLine.borderColorDisabled};
    color: ${props => props.theme.colors.textColorLighter};
    cursor: not-allowed;
  }
`

const SecondaryCSS = css`
  & {
    background-color: ${props => props.theme.buttonSecondary.backgroundColor};
    border-color: ${props => props.theme.buttonSecondary.borderColor};
    color: ${props => props.theme.buttonSecondary.color};
    font-weight: ${props => props.theme.buttonSecondary.weight};
  }

  &:hover {
    background-color: ${props => props.theme.buttonSecondary.backgroundColorHover};
    border-color: ${props => props.theme.buttonSecondary.borderColorHover};
    color: ${props => props.theme.buttonSecondary.colorHover};
  }

  &[disabled],
  &[disabled]:hover {
    background-color: ${props => props.theme.buttonSecondary.backgroundColorDisabled};
    border-color: ${props => props.theme.buttonSecondary.borderColorDisabled};
    color: ${props => props.theme.buttonSecondary.colorDisabled};
    cursor: not-allowed;
    opacity: 0.5;
  }
`

const SecondaryLineCSS = css`
  & {
    background-color: ${props => props.theme.buttonSecondaryLine.backgroundColor};
    border-color: ${props => props.theme.buttonSecondaryLine.borderColor};
    color: ${props => props.theme.buttonSecondaryLine.color};
  }

  &:hover {
    background-color: ${props => props.theme.buttonSecondaryLine.backgroundColorHover};
    border-color: ${props => props.theme.buttonSecondaryLine.borderColorHover};
    color: ${props => props.theme.buttonSecondaryLine.colorHover};
  }

  &[disabled],
  &[disabled]:hover {
    background-color: ${props => props.theme.buttonSecondaryLine.backgroundColorDisabled};
    border-color: ${props => props.theme.buttonSecondaryLine.borderColorDisabled};
    color: ${props => props.theme.buttonSecondaryLine.colorDisabled};
    cursor: not-allowed;
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

  if (buttonType === ButtonType.primaryAlternative) {
    return PrimaryAlternativeCSS
  }

  return PrimaryCSS
}

export const ButtonCSS = css`
  align-items: center;
  border-radius: 8px;
  border-style: solid;
  border-width: 1px;
  cursor: pointer;
  display: flex;
  font-size: ${({ theme }) => theme.fonts.defaultSize};
  line-height: ${({ theme }) => theme.fonts.defaultLineHeight};
  font-weight: 400;
  height: 40px;
  justify-content: center;
  letter-spacing: 0.2px;
  outline: none;
  padding: 12px 17px;
  pointer-events: ${props => ((props as any).disabled ? 'none' : 'initial')};
  text-align: center;
  transition: all 0.15s ease-out;
  user-select: none;
  white-space: nowrap;
  font-family: Roboto;

  ${props => getButtonTypeStyles((props as any).buttonType)}
`
