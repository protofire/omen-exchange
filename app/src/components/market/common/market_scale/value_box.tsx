import React from 'react'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'

import { IconInfo } from '../../../common/tooltip/img/IconInfo'
import { Circle } from '../../common/common_styled'
import { SCALE_HEIGHT, VALUE_BOXES_MARGIN } from '../common_styled'

const ValueBoxSegment = styled.div<{ threeBoxes?: boolean }>`
  font-size: ${props => props.theme.fonts.defaultSize};
  padding: 12px;
  border: 1px solid ${props => props.theme.scale.box};
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 50%;
  background: ${props => props.theme.colors.mainBodyBackground};

  &:nth-of-type(odd) {
    border-top-right-radius: ${props => (props.threeBoxes ? '4' : '0')}px;
    border-bottom-right-radius: ${props => (props.threeBoxes ? '4' : '0')}px;

    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }
  &:nth-of-type(even) {
    ${props => props.threeBoxes && 'margin-left:12px;margin-right:12px;'};
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    border-top-left-radius: ${props => (props.threeBoxes ? '4' : '0')}px;
    border-bottom-left-radius: ${props => (props.threeBoxes ? '4' : '0')}px;
    ${props => !props.threeBoxes && 'border-left:none'};
  }
`

const ValueBoxSingle = styled.div<{ xValue?: number }>`
  padding: 12px;
  border: ${props => props.theme.borders.borderLineDisabled}
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
      : ''};
  background: ${props => props.theme.colors.mainBodyBackground};
  position: absolute;
  top: calc(${SCALE_HEIGHT} + ${VALUE_BOXES_MARGIN});
  border-radius: 4px;
`

const ValueBoxTitle = styled.p<{ positive?: boolean | undefined }>`
  font-weight: 500;
  color: ${props => props.theme.colors.textColorDarker};
  margin-bottom: 2px;
  margin-top: 0;
  color: ${props =>
    props.positive ? props.theme.scale.positiveText : props.positive === false ? props.theme.scale.negativeText : ''};
`

const ValueBoxSubtitle = styled.p`
  color: ${props => props.theme.colors.textColor};
  margin: 0;
  white-space: nowrap;
  display: flex;
  align-items: center;
`

const PositionBall = styled.div`
  height: 8px;
  width: 8px;
  border-radius: 50%;
  background: ${props => props.theme.scale.positionBall};
  margin-right: 8px;
`

interface Props {
  title: string
  subtitle: string
  tooltip?: string
  positive?: boolean | undefined
  xValue?: number
  ball?: boolean | undefined
  hasThreeBoxes?: boolean
}

export const ValueBox: React.FC<Props> = (props: Props) => {
  const { ball, positive, subtitle, title, tooltip, xValue } = props

  if (xValue) {
    return (
      <ValueBoxSingle xValue={xValue && xValue}>
        <ValueBoxTitle positive={positive}>{title}</ValueBoxTitle>
        <ValueBoxSubtitle>{subtitle}</ValueBoxSubtitle>
      </ValueBoxSingle>
    )
  }

  return (
    <ValueBoxSegment threeBoxes={props.hasThreeBoxes}>
      <ValueBoxTitle positive={positive}>{title}</ValueBoxTitle>
      {tooltip && <ReactTooltip id="payoutTooltip" />}
      <ValueBoxSubtitle>
        {ball && <PositionBall />}
        {subtitle}
        {tooltip && (
          <Circle
            data-delay-hide={'500'}
            data-effect={'solid'}
            data-for={'payoutTooltip'}
            data-multiline={'true'}
            data-tip={tooltip}
          >
            <IconInfo />
          </Circle>
        )}
      </ValueBoxSubtitle>
    </ValueBoxSegment>
  )
}
