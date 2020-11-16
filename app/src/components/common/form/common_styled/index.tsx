import { css } from 'styled-components'

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
