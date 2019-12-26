import { css } from 'styled-components'

export const DatepickerStylesOverride = css`
  .react-datepicker {
    font-size: ${props => props.theme.fonts.defaultSize};
  }
  .react-datepicker__header {
    padding-top: 0.8em;
  }
  .react-datepicker__month {
    margin: 0.4em 1em;
  }
  .react-datepicker__day-name,
  .react-datepicker__day {
    line-height: 1.9em;
    margin: 0.166em;
    width: 1.9em;
  }
  .react-datepicker__current-month {
    font-size: ${props => props.theme.fonts.defaultSize};
  }
  .react-datepicker__navigation {
    border: 0.45em solid transparent;
    line-height: 1.7em;
    top: 1em;
  }
  .react-datepicker__navigation--previous {
    border-right-color: ${props => props.theme.borders.borderColor};
    left: 1em;
  }
  .react-datepicker__navigation--next {
    border-left-color: ${props => props.theme.borders.borderColor};
    right: 1em;
  }
  .react-datepicker-manager,
  .react-datepicker-wrapper,
  .react-datepicker__input-container {
    display: flex !important;
    width: 100%;
  }
`
