import { ethers } from 'ethers'
import { BigNumber } from 'ethers/utils'
import React, { ChangeEvent, InputHTMLAttributes, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

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
export enum BigNumberInputError {
  max,
  min,
  noError,
}

export interface BigNumberInputReturn {
  name: string
  value: BigNumber
}

type OverrideProperties<T, R> = Omit<T, keyof R> & R

interface PropsBigNumber extends InputHTMLAttributes<HTMLInputElement> {
  decimals: number
  valueFixedDecimals?: number
}

type Props = OverrideProperties<
  PropsBigNumber,
  {
    max?: BigNumber
    min?: BigNumber
    onChange: (value: BigNumberInputReturn) => void
    onError?: (e: BigNumberInputError) => void
    step?: BigNumber
    value: Maybe<BigNumber>
  }
>

export const BigNumberInput: React.FC<Props> = props => {
  const {
    autoFocus = false,
    decimals,
    disabled = false,
    max,
    min,
    name,
    onChange,
    onError,
    placeholder = '0.00',
    step,
    value,
    ...restProps
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
    if (autoFocus && inputRef && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const triggerError = (e: BigNumberInputError) => {
    if (onError) {
      onError(e)
    }
  }

  const clearError = () => {
    if (onError) {
      onError(BigNumberInputError.noError)
    }
  }

  const updateValue = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget

    try {
      if (!value) {
        onChange({ name, value: new BigNumber(0) })
      } else {
        const newValue = ethers.utils.parseUnits(value, decimals)
        const invalidValueMin = min && newValue.lt(min)
        const invalidValueMax = max && newValue.gt(max)
        const invalidValue = invalidValueMin || invalidValueMax

        clearError()

        invalidValueMin && triggerError(BigNumberInputError.min)
        invalidValueMax && triggerError(BigNumberInputError.max)

        if (invalidValue) return

        onChange({ name, value: newValue })
      }
      setCurrentValue(value)
    } catch (e) {
      console.error(e)
    }
  }

  const currentStep = step && ethers.utils.formatUnits(step, decimals)
  const currentMin = min && ethers.utils.formatUnits(min, decimals)
  const currentMax = max && ethers.utils.formatUnits(max, decimals)

  return (
    <Input
      autoComplete="off"
      data-testid={name}
      disabled={disabled}
      max={currentMax}
      min={currentMin}
      name={name}
      onChange={updateValue}
      placeholder={placeholder}
      ref={inputRef}
      step={currentStep}
      type="number"
      value={currentValue}
      {...restProps}
    />
  )
}
