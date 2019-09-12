import React, { ChangeEvent, Component } from 'react'
import styled from 'styled-components'

import { Button, Textfield } from '../../../common/index'

interface Props {
  back: () => void
  next: () => void
  values: {
    question: string
    outcomeValueOne: string
    outcomeValueTwo: string
    outcomeProbabilityOne: string
    outcomeProbabilityTwo: string
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

class OutcomesStep extends Component<Props> {
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
    const {
      outcomeValueOne,
      outcomeValueTwo,
      outcomeProbabilityOne,
      outcomeProbabilityTwo,
    } = values

    if (!outcomeValueOne || !outcomeValueTwo || !outcomeProbabilityOne || !outcomeProbabilityTwo) {
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
    const {
      question,
      outcomeProbabilityOne,
      outcomeProbabilityTwo,
      outcomeValueOne,
      outcomeValueTwo,
    } = values

    return (
      <>
        {this.state.errors.length > 0 && <p>{this.state.errors.join('. ')}</p>}
        <label>Please add all the possible outcomes for the &quot;{question}&quot; question</label>
        <Div>
          <label>Outcome *</label>
          <Textfield
            name="outcomeValueOne"
            type="text"
            defaultValue={outcomeValueOne}
            onChange={handleChange}
          />
          <Textfield
            name="outcomeValueTwo"
            type="text"
            defaultValue={outcomeValueTwo}
            onChange={handleChange}
          />
        </Div>
        <Div>
          <label>Probability *</label>
          <Textfield
            name="outcomeProbabilityOne"
            type="text"
            defaultValue={outcomeProbabilityOne}
            onChange={handleChange}
          />
          <Textfield
            name="outcomeProbabilityTwo"
            type="text"
            defaultValue={outcomeProbabilityTwo}
            onChange={handleChange}
          />
        </Div>
        <Button onClick={this.back}>Back</Button>
        <Button onClick={this.validate}>Next</Button>
      </>
    )
  }
}

export { OutcomesStep }
