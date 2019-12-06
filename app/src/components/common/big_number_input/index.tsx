import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { ethers } from 'ethers'
import { BigNumber } from 'ethers/utils'

export interface BigNumberInputReturn {
  name: string
  value: BigNumber
}

interface Props {
  decimals: number
  name: string
  autofocus?: boolean
  className?: string
  placeholder?: string
  max?: BigNumber
  min?: BigNumber
  onChange: (value: BigNumberInputReturn) => void
  step?: BigNumber
  value: Maybe<BigNumber>
  valueFixedDecimals?: number
  disabled?: boolean
}

const Input = styled.input`
  ::-webkit-inner-spin-button,
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;

  &:focus {
    outline: none;
  }
`

export const BigNumberInput = (props: Props) => {
  const {
    placeholder = '0.00',
    autofocus = false,
    value,
    decimals,
    name,
    step,
    min,
    max,
    className,
    disabled = false,
    onChange,
  } = props

  const [currentValue, setCurrentValue] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!value) {
      setCurrentValue('')
    } else if (value && !ethers.utils.parseUnits(currentValue || '0', decimals).eq(value)) {
      setCurrentValue(ethers.utils.formatUnits(value, decimals))
    }
  }, [value, decimals, currentValue])

  useEffect(() => {
    if (autofocus && inputRef && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autofocus])

  const updateValue = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget

    if (!value) {
      onChange({ name, value: new BigNumber(0) })
    } else {
      const newValue = ethers.utils.parseUnits(value, decimals)
      const invalidValue = (min && newValue.lt(min)) || (max && newValue.gt(max))

      if (invalidValue) {
        return
      }

      onChange({ name, value: newValue })
    }

    setCurrentValue(value)
  }

  const currentStep = step && ethers.utils.formatUnits(step, decimals)
  const currentMin = min && ethers.utils.formatUnits(min, decimals)
  const currentMax = max && ethers.utils.formatUnits(max, decimals)

  return (
    <Input
      data-testid={name}
      className={className}
      max={currentMax}
      min={currentMin}
      onChange={updateValue}
      ref={inputRef}
      step={currentStep}
      type={'number'}
      name={name}
      value={currentValue}
      placeholder={placeholder}
      disabled={disabled}
    />
  )
}
