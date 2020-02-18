import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'
import CheckOn from './img/CheckOn.svg'

interface OwnProps {
  checked?: boolean
  disabled?: boolean
  name: string
  value?: any
  label?: string
}

interface Props extends HTMLAttributes<HTMLDivElement>, OwnProps {}

const CheckboxWrapper = styled.div`
  cursor: pointer;
  position: relative;
  display: flex;

  > input {
    cursor: pointer;
    height: 100%;
    left: 0;
    opacity: 0;
    position: absolute;
    top: 0;
    width: 100%;
    z-index: 5;

    &:checked ~ span.checkbox {
      background: #00be95 url(${CheckOn}) center center no-repeat;
      background-size: 12px 14px;
    }
  }

  span.checkbox {
    display: inline-block;
    left: 0;
    position: relative;
    top: 0;
    z-index: 1;
    width: 16px;
    height: 16px;
    background-color: #999;
    border-radius: 2px;
  }

  label.checkbox-label {
    font-size: 11px;
    font-weight: 500;
    color: #000000;
    padding-left: 4px;
  }
`

export const CheckboxInput: React.FC<Props> = (props: Props) => {
  const { onChange, value, disabled, name, checked, label, ...restProps } = props
  return (
    <CheckboxWrapper {...restProps}>
      <input
        checked={checked}
        name={name}
        onChange={onChange}
        disabled={disabled}
        type="checkbox"
        value={value}
      />
      <span className="checkbox"></span>
      {label && <label className="checkbox-label">{label}</label>}
    </CheckboxWrapper>
  )
}
