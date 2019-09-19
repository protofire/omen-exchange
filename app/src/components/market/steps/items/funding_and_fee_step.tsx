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

  public back = () => {
    this.props.back()
  }

  public validate = (e: any) => {
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
        {this.state.errors.length > 0 && (
          <p>
            <i>{this.state.errors.join('. ')}</i>
          </p>
        )}
        <div className="row">
          <div className="col">
            <label>Spread/Fee *</label>
            <Div>
              <Textfield type="text" name="spread" defaultValue={spread} onChange={handleChange} />
            </Div>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <label>Funding *</label>
            <Div>
              <Textfield
                type="text"
                name="funding"
                defaultValue={funding}
                onChange={handleChange}
              />
            </Div>
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

export { FundingAndFeeStep }
