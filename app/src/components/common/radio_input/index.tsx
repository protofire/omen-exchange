import React, { DOMAttributes } from 'react'
import styled, { css } from 'styled-components'

const RadioWrapper = styled.div`
  cursor: pointer;
  position: relative;

  > input {
    cursor: pointer;
    height: 100%;
    left: 0;
    opacity: 0;
    position: absolute;
    top: 0;
    width: 100%;
    z-index: 5;
  }
`

const RadioCSS = css`
  border-radius: 50%;
  border-style: solid;
  height: 20px;
  width: 20px;
`

const RadioOn = styled.div<{ outcomeIndex: number }>`
  ${RadioCSS}
  border-color: ${props =>
    props.theme.outcomes.colors[props.outcomeIndex] ? props.theme.outcomes.colors[props.outcomeIndex] : '#999'};
  border-width: 4px;
`

const RadioOff = styled.div<{ outcomeIndex: number }>`
  ${RadioCSS}
  border-color: ${props =>
    props.theme.outcomes.colors[props.outcomeIndex] ? props.theme.outcomes.colors[props.outcomeIndex] : '#999'};
  border-width: 2px;
  opacity: 0.5;
`

interface Props extends DOMAttributes<HTMLDivElement> {
  checked?: boolean
  disabled?: boolean
  name: string
  outcomeIndex: number
  value?: any
}

export const RadioInput: React.FC<Props> = (props: Props) => {
  const { checked, disabled, name, onChange, outcomeIndex, value, ...restProps } = props
  return (
    <RadioWrapper {...restProps}>
      {checked ? <RadioOn outcomeIndex={outcomeIndex} /> : <RadioOff outcomeIndex={outcomeIndex} />}
      <input checked={checked} disabled={disabled} name={name} onChange={onChange} type="radio" value={value} />
    </RadioWrapper>
  )
}
