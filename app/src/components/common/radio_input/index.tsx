import React, { DOMAttributes } from 'react'
import styled from 'styled-components'

import RadioOff from './img/RadioOff'
import RadioOn from './img/RadioOn'

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

  > svg {
    display: block;
    left: 0;
    position: relative;
    top: 0;
    z-index: 1;
  }
`

interface Props extends DOMAttributes<HTMLDivElement> {
  checked?: boolean
  disabled?: boolean
  name: string
  outcomeIndex?: number
  value?: any
}

export const RadioInput: React.FC<Props> = (props: Props) => {
  const { checked, disabled, name, onChange, value, ...restProps } = props
  return (
    <RadioWrapper {...restProps}>
      {checked ? <RadioOn /> : <RadioOff />}
      <input checked={checked} disabled={disabled} name={name} onChange={onChange} type="radio" value={value} />
    </RadioWrapper>
  )
}
