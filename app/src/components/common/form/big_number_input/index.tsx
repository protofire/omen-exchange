import { ethers } from 'ethers'
import { BigNumber } from 'ethers/utils'
import React, { ChangeEvent, InputHTMLAttributes, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { getLogger } from '../../../../util/logger'

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
    onChange: (value: BigNumberInputReturn) => void
    step?: BigNumber
    value: Maybe<BigNumber>
    valueToDisplay?: string
  }
>

const logger = getLogger('BigNumberInput')

export const BigNumberInput: React.FC<Props> = props => {
  const {
    autoFocus = false,
    decimals,
    disabled = false,
    name,
    onChange,
    placeholder = '0.00',
    step,
    value,
    valueToDisplay = '',
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

  const updateValue = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget

    try {
      if (!value) {
        onChange({ name, value: new BigNumber(0) })
      } else {
        const newValue = ethers.utils.parseUnits(value, decimals)

        onChange({ name, value: newValue })
      }
      setCurrentValue(value)
    } catch (e) {
      console.error(e)
    }
  }

  const currentStep = step && ethers.utils.formatUnits(step, decimals)
  logger.log(`Value to display: "${valueToDisplay}"`, `Value used in the background: "${currentValue}"`)

  return (
    <Input
      autoComplete="off"
      data-testid={name}
      disabled={disabled}
      name={name}
      onChange={updateValue}
      placeholder={placeholder}
      ref={inputRef}
      step={currentStep}
      type="number"
      value={valueToDisplay || currentValue}
      {...restProps}
    />
  )
}
