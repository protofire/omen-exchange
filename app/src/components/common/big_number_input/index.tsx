import React from 'react'
import styled from 'styled-components'
import { BigNumber } from 'ethers/utils'

import { TokenAmount } from '../../../util/token_amount'
import { Maybe } from '../../../util/types'

interface Props {
  autofocus?: boolean
  className?: string
  decimals: number
  placeholder?: string
  max?: BigNumber
  min?: BigNumber
  onChange: (newValue: BigNumber | null) => void
  step?: BigNumber
  value: Maybe<BigNumber>
  valueFixedDecimals?: number
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

  private textInput: any

  public static getDerivedStateFromProps = (props: Props, state: State) => {
    const { decimals, value, valueFixedDecimals } = props
    const { currentValueStr } = state

    if (!value) {
      return {
        currentValueStr: '',
      }
    } else if (
      value &&
      !TokenAmount.fromString(currentValueStr || '0', decimals).amount.eq(value)
    ) {
      return {
        currentValueStr: TokenAmount.format(value, decimals, valueFixedDecimals),
      }
    } else {
      return null
    }
  }

  public readonly state = {
    currentValueStr: this.props.value
      ? TokenAmount.format(this.props.value, this.props.decimals, this.props.valueFixedDecimals)
      : '',
  }

  public componentDidMount = () => {
    const { autofocus } = this.props

    if (autofocus) {
      this.textInput.focus()
    }
  }

  public render = () => {
    const { currentValueStr } = this.state
    const { decimals, step, min, max, className, placeholder } = this.props
    const stepStr = step && TokenAmount.format(step, decimals)
    const minStr = min && TokenAmount.format(min, decimals)
    const maxStr = max && TokenAmount.format(max, decimals)

    return (
      <Input
        className={className}
        max={maxStr}
        min={minStr}
        onChange={this.updateValue}
        ref={ref => (this.textInput = ref)}
        step={stepStr}
        type={'number'}
        value={currentValueStr}
        placeholder={placeholder}
      />
    )
  }

  private readonly updateValue: React.ReactEventHandler<HTMLInputElement> = e => {
    const { decimals, onChange, min, max } = this.props
    const newValueStr = e.currentTarget.value

    if (!newValueStr) {
      onChange(null)
    } else {
      const newValue = TokenAmount.fromString(newValueStr || '0', decimals).amount
      const invalidValue = (min && newValue.lt(min)) || (max && newValue.gt(max))

      if (invalidValue) {
        return
      }

      onChange(newValue)
    }

    this.setState({
      currentValueStr: newValueStr,
    })
  }
}
