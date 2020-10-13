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

  .customMarketTooltip {
    &.__react_component_tooltip.type-light {
      &.place-top:after {
        border: 0 solid #eceff1 !important;
      }

      font-family: Roboto;
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      line-height: 20px;
      letter-spacing: 0.10000000149011612px;
      text-align: left;

      text-align: left;
      background-color: #ffffff;
      opacity: 1;
      border-radius: 6px;
      box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
      border: 1px solid #eceff1;
    }
  }
`
