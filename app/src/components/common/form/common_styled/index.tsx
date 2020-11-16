import styled, { css } from 'styled-components'

interface StatefulRadioButton {
  selected?: boolean
  disabled?: boolean
}

export const CommonDisabledCSS = css`
  &.disabled,
  &.disabled:hover,
  &:disabled,
  &:disabled:hover,
  &[disabled],
  &[disabled]:hover {
    background-color: ${props => props.theme.form.common.disabled.backgroundColor};
    border-color: ${props => props.theme.form.common.disabled.borderColor};
    color: ${props => props.theme.form.common.disabled.color};
    cursor: not-allowed !important;
    user-select: none !important;

    .chevronDown {
      filter: invert(46%) sepia(0%) saturate(1168%) hue-rotate(183deg) brightness(99%) contrast(89%);
    }
  }
`
export const CurationRow = styled.div`
  border-bottom: ${props => props.theme.cards.border};
  margin: 0 -25px;
  padding: 20px 25px;
  position: relative;
`
export const CurationSubRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: nowrap;
  position: relative;
`
export const CurationLeftColumn = styled.div`
  margin-right: 16px;
`

export const CurationCenterColumn = styled.div``

export const CurationRightColumn = styled.div`
  margin-left: auto;
  text-align: right;
  color: ${props => props.theme.colors.textColorDar};
  font-weight: 500;
`

export const CurationLogoWrapper = styled.div`
  padding: 11px;
  border-radius: 50%;
  border: 1px solid ${props => props.theme.colors.tertiary};
  width: 48px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
`

export const CurationRadioWrapper = styled.div<StatefulRadioButton>`
  border-radius: 50%;
  border: 1px solid ${props => props.theme.buttonPrimaryLine.borderColorDisabled};
  cursor: ${props => (props.disabled ? 'initial' : 'pointer')};
  width: 38px;
  height: 38px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.selected && props.theme.colors.clickable};

  &:hover {
    border-color: ${props => !props.disabled && props.theme.colors.tertiary};
  }
`

export const CurationOption = styled.div`
  color: ${props => props.theme.colors.textColorDarker};
  font-weight: 500;
`

export const CurationOptionDetails = styled.div`
  color: ${props => props.theme.colors.textColorLighter};
  font-weight: 400;
`
