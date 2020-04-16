import { css } from 'styled-components'

export const ReactTooltipStylesOverride = css`
  .customTooltip {
    background-color: #313131;
    color: #fff;
    font-size: 11px;
    line-height: 1.3;
    max-width: 180px;
    opacity: 1;
    padding: 5px 8px;
    text-align: left;

    > a {
      color: #fff;
      text-decoration: underline;
    }
    > a:hover {
      color: #00f;
    }

    &.place-left:after {
      border-left-color: #000;
    }

    &.place-right:after {
      border-right-color: #000;
    }

    &.place-top:after {
      border-top-color: #000;
    }

    &.place-bottom:after {
      border-bottom-color: #000;
    }

    .multi-line {
      text-align: left;
    }

    &.__react_component_tooltip.type-dark.place-top:after {
      border-top-color: #313131;
      border-top-width: 10px;
      bottom: -8px;
    }
  }
`
