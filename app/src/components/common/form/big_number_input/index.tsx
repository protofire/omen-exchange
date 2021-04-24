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
  formattedValue?: string
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
    formatOnMount?: boolean
  }
>

const logger = getLogger('BigNumberInput')

export const BigNumberInput: React.FC<Props> = props => {
  const {
    autoFocus = false,
    decimals,
    disabled = false,
    formatOnMount = false,
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
  const mounted = useRef(false)
  const prevDecimals = useRef(0)

  useEffect(() => {
    try {
      if (!value) {
        setCurrentValue('')
      } else if (
        (!mounted.current && formatOnMount) ||
        (prevDecimals.current && prevDecimals.current !== decimals) ||
        (value && !ethers.utils.parseUnits(currentValue || '0', decimals).eq(value))
      ) {
        if (!mounted.current) {
          mounted.current = true
        }
        const formatted = ethers.utils.formatUnits(value, decimals)
        setCurrentValue(formatted.endsWith('.0') ? formatted.substring(0, formatted.length - 2) : formatted)
      }
      prevDecimals.current = decimals
    } catch (e) {
      logger.log(e.message)
    }
  }, [value, decimals, currentValue, formatOnMount])

  useEffect(() => {
    if (autoFocus && inputRef && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const updateValue = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget

    try {
      if (!value) {
        onChange({ name, value: new BigNumber(0), formattedValue: new BigNumber(0).toString() })
      } else {
        const newValue = ethers.utils.parseUnits(value, decimals)

        onChange({ name, value: newValue, formattedValue: value })
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
