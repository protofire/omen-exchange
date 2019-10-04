import React from 'react'
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

interface State {
  currentValueStr: string
}

const Input = styled.input`
  ::-webkit-inner-spin-button,
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
`

export class BigNumberInput extends React.Component<Props, State> {
  public static defaultProps = {
    placeholder: '0.00',
  }

  public readonly state = {
    currentValueStr: this.props.value
      ? ethers.utils.formatUnits(this.props.value, this.props.decimals)
      : '',
  }

  private textInput: any

  public static getDerivedStateFromProps = (props: Props, state: State) => {
    const { decimals, value } = props
    const { currentValueStr } = state

    if (!value) {
      return {
        currentValueStr: '',
      }
    } else if (value && !ethers.utils.parseUnits(currentValueStr || '0', decimals).eq(value)) {
      return {
        currentValueStr: ethers.utils.formatUnits(value, decimals),
      }
    } else {
      return null
    }
  }

  public componentDidMount = () => {
    const { autofocus } = this.props

    if (autofocus) {
      this.textInput.focus()
    }
  }

  private readonly updateValue: React.ReactEventHandler<HTMLInputElement> = e => {
    const { decimals, onChange, min, max } = this.props
    const newValueStr = e.currentTarget.value

    if (!newValueStr) {
      onChange({ name: e.currentTarget.name, value: new BigNumber(0) })
    } else {
      const newValue = ethers.utils.parseUnits(newValueStr || '0', decimals)
      const invalidValue = (min && newValue.lt(min)) || (max && newValue.gt(max))

      if (invalidValue) {
        return
      }

      onChange({ name: e.currentTarget.name, value: newValue })
    }

    this.setState({
      currentValueStr: newValueStr,
    })
  }

  public render = () => {
    const { currentValueStr } = this.state
    const { name, decimals, step, min, max, className, placeholder, disabled = false } = this.props
    const stepStr = step && ethers.utils.formatUnits(step, decimals)
    const minStr = min && ethers.utils.formatUnits(min, decimals)
    const maxStr = max && ethers.utils.formatUnits(max, decimals)

    return (
      <Input
        className={className}
        max={maxStr}
        min={minStr}
        onChange={this.updateValue}
        ref={ref => (this.textInput = ref)}
        step={stepStr}
        type={'number'}
        name={name}
        value={currentValueStr}
        placeholder={placeholder}
        disabled={disabled}
      />
    )
  }
}
