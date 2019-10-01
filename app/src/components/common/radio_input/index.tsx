import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'
import RadioOff from './img/RadioOff'
import RadioOn from './img/RadioOn'

interface OwnProps {
  checked?: boolean
  name: string
  value?: any
}

interface Props extends HTMLAttributes<HTMLDivElement>, OwnProps {}

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

export const RadioInput: React.FC<Props> = (props: Props) => {
  const { onChange, value, name, checked, ...restProps } = props

  return (
    <RadioWrapper {...restProps}>
      {checked ? <RadioOn /> : <RadioOff />}
      <input checked={checked} name={name} onChange={onChange} type="radio" value={value} />
    </RadioWrapper>
  )
}
