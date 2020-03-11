import { ethers } from 'ethers'
import { BigNumber } from 'ethers/utils'
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

export interface BigNumberInputReturn {
  name: string
  value: BigNumber
}

interface Props {
  autofocus?: boolean
  className?: string
  decimals: number
  disabled?: boolean
  max?: BigNumber
  min?: BigNumber
  name: string
  onChange: (value: BigNumberInputReturn) => void
  placeholder?: string
  step?: BigNumber
  value: Maybe<BigNumber>
  valueFixedDecimals?: number
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
    autofocus = false,
    className,
    decimals,
    disabled = false,
    max,
    min,
    name,
    onChange,
    placeholder = '0.00',
    step,
    value,
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
      className={className}
      data-testid={name}
      disabled={disabled}
      max={currentMax}
      min={currentMin}
      name={name}
      onChange={updateValue}
      placeholder={placeholder}
      ref={inputRef}
      step={currentStep}
      type={'number'}
      value={currentValue}
    />
  )
}
