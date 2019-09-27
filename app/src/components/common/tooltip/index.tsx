import React, { HTMLAttributes } from 'react'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'
import { IconInfo } from './img/IconInfo'

const TooltipPopup = styled.div`
  cursor: pointer;
  display: flex;
  justify-content: center;
  outline: none;
  position: relative;
  white-space: normal;

  > svg {
    margin-left: 5px;

    path {
      fill: rgba(0, 0, 0, 0.5);
    }

    &:hover {
      path {
        fill: #000;
      }
    }
  }

  .reactTooltip {
    background-color: #313131;
    color: #fff;
    font-size: 11px;
    line-height: 1.3;
    max-width: 180px;
    opacity: 1;
    text-align: left;

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
  }
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  description: string
}

export const Tooltip = (props: Props) => {
  const { description, ...restProps } = props

  return (
    <TooltipPopup
      data-class="reactTooltip"
      data-tip={description}
      data-multiline={true}
      {...restProps}
    >
      <IconInfo />
      <ReactTooltip />
    </TooltipPopup>
  )
}

export default Tooltip
