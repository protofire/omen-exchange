import React, { ChangeEvent, Component } from 'react'

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

class OutcomesStep extends Component<Props> {
  public state: State = {
    errors: [],
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
        {this.state.errors.length > 0 && (
          <p>
            <i>{this.state.errors.join('. ')}</i>
          </p>
        )}
        <h6>Please add all the possible outcomes for the &quot;{question}&quot; question</h6>
        <div className="row">
          <div className="col left">
            <label>Outcome</label>
          </div>
          <div className="col left">
            <label>Probability *</label>
          </div>
        </div>
        <div className="row">
          <div className="col left">
            <p>{outcomeValueOne}</p>
          </div>
          <div className="col left">
            <Textfield
              name="outcomeProbabilityOne"
              type="text"
              defaultValue={outcomeProbabilityOne}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="row">
          <div className="col left">
            <p>{outcomeValueTwo}</p>
          </div>
          <div className="col left">
            <Textfield
              name="outcomeProbabilityTwo"
              type="text"
              defaultValue={outcomeProbabilityTwo}
              onChange={handleChange}
            />
          </div>
        </div>
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
