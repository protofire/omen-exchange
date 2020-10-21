import React, { MouseEventHandler } from 'react'
import styled from 'styled-components'

import { IconMiniDown, IconMiniUp } from '../../../common/icons'

interface Props {
  mainLabel: string
  alternativeLabel: string
  isMain?: boolean
  onClick?: MouseEventHandler
}

const Wrapper = styled.div<{ rotate?: boolean }>`
  display: flex;
  align-items: center;
  cursor: pointer;
  height: 16px;
  .text-toggle-label {
    color: ${({ theme }) => theme.colors.clickable};
    margin-left: 10px;
    font-size: 14px;
    line-height: 16px;
    font-weight: 400;
  }
`

export const TextToggle = (props: Props) => {
  const { alternativeLabel, isMain, mainLabel, onClick } = props
  return (
    <Wrapper onClick={onClick} rotate={!isMain}>
      {isMain ? <IconMiniDown /> : <IconMiniUp />}
      <div className="text-toggle-label">{isMain ? mainLabel : alternativeLabel}</div>
    </Wrapper>
  )
}
