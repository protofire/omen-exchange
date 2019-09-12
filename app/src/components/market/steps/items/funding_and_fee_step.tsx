import React, { ChangeEvent, Component } from 'react'
import styled from 'styled-components'

import { Button, Textfield } from '../../../common/index'

interface Props {
  back: () => void
  next: () => void
  values: {
    spread: string
    funding: string
  }
  handleChange: (event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => any
}

interface State {
  errors: string[]
}

const Div = styled.div`
  height: 50px;
  display: flex;
  align-items: center;
`

class FundingAndFeeStep extends Component<Props> {
  public state: State = {
    errors: [],
  }

  constructor(props: Props) {
    super(props)
    this.back = this.back.bind(this)
    this.validate = this.validate.bind(this)
  }

  public back(): void {
    this.props.back()
  }

  public validate(e: any): void {
    e.preventDefault()

    const { values } = this.props
    const { spread, funding } = values

    if (!spread || !funding) {
      const errors = []
      errors.push(`Please check the required fields`)
      this.setState({
        errors,
      })
    } else {
      this.props.next()
    }
  }

  render() {
    const { values, handleChange } = this.props
    const { spread, funding } = values
    return (
      <>
        {this.state.errors.length > 0 && <p>{this.state.errors.join('. ')}</p>}
        <Div>
          <label>Spread/Fee *</label>
          <Textfield type="text" name="spread" defaultValue={spread} onChange={handleChange} />
        </Div>
        <Div>
          <label>Funding *</label>
          <Textfield type="text" name="funding" defaultValue={funding} onChange={handleChange} />
        </Div>
        <Button onClick={this.back}>Back</Button>
        <Button onClick={this.validate}>Next</Button>
      </>
    )
  }
}

export { FundingAndFeeStep }
