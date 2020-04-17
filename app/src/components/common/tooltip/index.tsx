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
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  description: string
  id: string
}

export const Tooltip = (props: Props) => {
  const { description, id, ...restProps } = props

  return (
    <TooltipPopup data-for={id} data-html={true} data-multiline={true} data-tip={description} {...restProps}>
      <IconInfo />
      <ReactTooltip className="customTooltip" clickable={true} delayHide={500} effect="solid" id={id} />
    </TooltipPopup>
  )
}

export default Tooltip
