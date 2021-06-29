import React, { DOMAttributes } from 'react'
import styled from 'styled-components'

import { getOutcomeColor } from '../../../../theme/utils'

const Wrapper = styled.div`
  cursor: pointer;
  position: relative;
`

const Radio = styled.div<{ outcomeIndex: number; checked: boolean }>`
  border-radius: 50%;
  width: 20px;
  height: 20px;
  ${props =>
    props.outcomeIndex > -1
      ? `background-color: ${props.checked ? getOutcomeColor(props.outcomeIndex).darker : '#fff'};
    border-color: ${
      getOutcomeColor(props.outcomeIndex).darker
        ? getOutcomeColor(props.outcomeIndex).darker
        : props.theme.colors.primary
    };
    border-style: solid;
    border-width: 2px;
    box-shadow: inset 0 0 0 2px #fff;
    transition: all 0.15s linear;
    opacity: ${props.checked ? '1' : '0.5'};`
      : `border: ${props.checked ? props.theme.borders.radioButton : props.theme.borders.radioButtonDisabled}
    `}
`

const Input = styled.input<{ disabled: boolean | undefined }>`
  height: 100%;
  left: 0;
  opacity: 0;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 5;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
`

interface Props extends DOMAttributes<HTMLDivElement> {
  checked?: boolean
  disabled?: boolean
  name: string
  outcomeIndex: number
  readOnly?: boolean
  value?: any
}

export const RadioInput: React.FC<Props> = (props: Props) => {
  const { checked = false, disabled, name, onChange, outcomeIndex, readOnly = false, value, ...restProps } = props

  return (
    <Wrapper {...restProps}>
      <Radio checked={checked} outcomeIndex={outcomeIndex} />
      <Input
        checked={checked}
        disabled={disabled}
        name={name}
        onChange={onChange}
        readOnly={readOnly}
        type="radio"
        value={value}
      />
    </Wrapper>
  )
}
