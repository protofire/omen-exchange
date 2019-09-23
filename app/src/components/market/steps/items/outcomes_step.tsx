import React, { ChangeEvent, Component } from 'react'
import styled from 'styled-components'

import { Button, Outcomes } from '../../../common/index'

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
  error: string | null
}

const PWarn = styled.p`
  color: red;
`

class OutcomesStep extends Component<Props> {
  public state: State = {
    error: null,
  }

  public back = () => {
    this.props.back()
  }

  public validate = (e: any) => {
    e.preventDefault()

    const { values } = this.props
    const {
      outcomeValueOne,
      outcomeValueTwo,
      outcomeProbabilityOne,
      outcomeProbabilityTwo,
    } = values

    let error = null
    if (!outcomeValueOne || !outcomeValueTwo || !outcomeProbabilityOne || !outcomeProbabilityTwo) {
      error = `Please check the required fields`
    }

    console.log(`One ${outcomeProbabilityOne}, Two ${outcomeProbabilityTwo}`)
    const probability = +outcomeProbabilityOne + +outcomeProbabilityTwo
    if (probability > 100) {
      error = `The sum of the probabilities cannot be greater than 100`
    }

    if (probability !== 100) {
      error = `The sum of the probabilities must be 100`
    }

    this.setState({
      error,
    })

    if (!error) {
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

    const outcomes = [
      {
        value: outcomeValueOne,
        probability: outcomeProbabilityOne,
        name: 'outcomeProbabilityOne',
      },
      {
        value: outcomeValueTwo,
        probability: outcomeProbabilityTwo,
        name: 'outcomeProbabilityTwo',
      },
    ]

    return (
      <>
        {this.state.error && (
          <PWarn>
            <i>{this.state.error}</i>
          </PWarn>
        )}
        <h6>Please add all the possible outcomes for the &quot;{question}&quot; question</h6>
        <Outcomes outcomes={outcomes} handleChange={handleChange} />
        <div className="row">
          <div className="col left">
            <Button onClick={this.back}>Back</Button>
          </div>
          <div className="col right">
            <Button onClick={this.validate}>Next</Button>
          </div>
        </div>
      </>
    )
  }
}

export { OutcomesStep }
