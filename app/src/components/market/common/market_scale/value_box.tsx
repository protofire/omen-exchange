import React from 'react'
import styled from 'styled-components'

import { ValueBoxItem } from '../../../../util/types'
import { SCALE_HEIGHT, VALUE_BOXES_MARGIN } from '../common_styled'

const ValueBoxSegment = styled.div`
  padding: 12px;
  border: 1px solid ${props => props.theme.scale.box};
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 50%;
  background: white;

  &:nth-of-type(odd) {
    border-top-right-radius: 0px;
    border-bottom-right-radius: 0px;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }
  &:nth-of-type(even) {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
    border-left: none;
  }
`

const ValueBoxSingle = styled.div<{ xValue?: number }>`
  padding: 12px;
  border: 1px solid ${props => props.theme.scale.box};
  display: flex;
  flex-direction: column;
  align-items: center;
  ${props =>
    props.xValue
      ? props.xValue <= 0.885
        ? `left: ${
            props.xValue <= 0.115
              ? `0`
              : props.xValue <= 0.885
              ? `${props.xValue * 100}%; transform: translateX(-50%);`
              : ``
          }`
        : `right: 0;`
      : ''}
  background: white;
  position: absolute;
  top: calc(${SCALE_HEIGHT} + ${VALUE_BOXES_MARGIN});
  border-radius: 4px;
`

const ValueBoxTitle = styled.p<{ positive?: boolean | undefined }>`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.colors.textColorDarker};
  margin-bottom: 2px;
  margin-top: 0;
  color: ${props =>
    props.positive ? props.theme.scale.positiveText : props.positive === false ? props.theme.scale.negativeText : ''};
`

const ValueBoxSubtitle = styled.p`
  font-size: 14px;
  color: ${props => props.theme.colors.textColor};
  margin: 0;
  white-space: nowrap;
  display: flex;
  align-items: center;
`

interface Props {
  title: string
  subtitle: string
  tooltip?: string
  positive?: boolean | undefined
  xValue?: number
  dataValue?: number
}

export const ValueBox: React.FC<Props> = (props: Props) => {
  const { dataValue, positive, subtitle, title, tooltip, xValue } = props

  if (xValue) {
    return (
      <ValueBoxSingle xValue={xValue && xValue}>
        <ValueBoxTitle positive={positive}>{title}</ValueBoxTitle>
        <ValueBoxSubtitle>{subtitle}</ValueBoxSubtitle>
      </ValueBoxSingle>
    )
  }

  return <ValueBoxSegment></ValueBoxSegment>
}
