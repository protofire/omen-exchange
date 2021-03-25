import React from 'react'
import styled from 'styled-components'

import { ValueBoxItem } from '../../../../util/types'
import { VALUE_BOXES_MARGIN } from '../common_styled'

import { ValueBox } from './value_box'

const ValueBoxWrapper = styled.div<{ hasThreeBoxes?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${VALUE_BOXES_MARGIN};
  width: 100%;

  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    flex-direction: ${props => (props.hasThreeBoxes ? 'row' : 'column')};
    justify-content: center;
  }
`

const ValueBoxPair = styled.div`
  width: calc(50% - ${VALUE_BOXES_MARGIN} / 2);
  display: flex;
  align-items: center;

  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    width: calc(100% - ${VALUE_BOXES_MARGIN} / 2);

    &:nth-of-type(2) {
      margin-top: 12px;
    }
  }
`

interface Props {
  valueBoxData: ValueBoxItem[]
}

export const ValueBoxes: React.FC<Props> = (props: Props) => {
  const { valueBoxData } = props

  const mappedValueBoxes = valueBoxData.map((valueBox, index) => {
    return (
      <ValueBox
        ball={valueBox.ball}
        hasThreeBoxes={valueBoxData.length === 3 ? true : false}
        key={index}
        positive={valueBox.positive}
        subtitle={valueBox.subtitle}
        title={valueBox.title}
        tooltip={valueBox.tooltip}
        xValue={valueBox.xValue}
      />
    )
  })

  return (
    <ValueBoxWrapper hasThreeBoxes={valueBoxData.length === 3 ? true : false}>
      {mappedValueBoxes.length === 4 ? (
        <>
          <ValueBoxPair>
            {mappedValueBoxes[0]}
            {mappedValueBoxes[1]}
          </ValueBoxPair>
          <ValueBoxPair>
            {mappedValueBoxes[2]}
            {mappedValueBoxes[3]}
          </ValueBoxPair>
        </>
      ) : (
        mappedValueBoxes
      )}
    </ValueBoxWrapper>
  )
}
