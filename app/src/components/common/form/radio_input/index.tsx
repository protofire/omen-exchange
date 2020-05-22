import React, { DOMAttributes } from 'react'
import styled from 'styled-components'

import { getOutcomeColor } from '../../../../theme/utils'

const Wrapper = styled.div`
  cursor: pointer;
  position: relative;
`

const Radio = styled.div<{ outcomeIndex: number; checked: boolean }>`
  background-color: ${props => (props.checked ? getOutcomeColor(props.outcomeIndex).darker : '#fff')};
  border-color: ${props =>
    getOutcomeColor(props.outcomeIndex).darker
      ? getOutcomeColor(props.outcomeIndex).darker
      : props.theme.colors.primary};
  border-radius: 50%;
  border-style: solid;
  border-width: 2px;
  box-shadow: inset 0 0 0 2px #fff;
  height: 20px;
  opacity: ${props => (props.checked ? '1' : '0.5')};
  transition: all 0.15s linear;
  width: 20px;
`

const Input = styled.input`
  cursor: pointer;
  height: 100%;
  left: 0;
  opacity: 0;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 5;
`

interface Props extends DOMAttributes<HTMLDivElement> {
  checked?: boolean
  disabled?: boolean
  name: string
  outcomeIndex: number
  value?: any
}

export const RadioInput: React.FC<Props> = (props: Props) => {
  const { checked = false, disabled, name, onChange, outcomeIndex, value, ...restProps } = props
  return (
    <Wrapper {...restProps}>
      <Radio checked={checked} outcomeIndex={outcomeIndex} />
      <Input checked={checked} disabled={disabled} name={name} onChange={onChange} type="radio" value={value} />
    </Wrapper>
  )
}
