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

const PWarn = styled.p`
  color: red;
`

const InputStyled = styled(Textfield)`
  text-align: right;
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`

const Span = styled.span`
  margin-left: 5px;
  width: 25px;
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
          <PWarn>
            <i>{this.state.errors.join('. ')}</i>
          </PWarn>
        )}
        <div className="row">
          <div className="col">
            <label>Spread/Fee *</label>
            <Div>
              <InputStyled
                type="number"
                name="spread"
                defaultValue={spread}
                onChange={handleChange}
              />
              <Span>%</Span>
            </Div>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <label>Funding *</label>
            <Div>
              <InputStyled
                type="number"
                name="funding"
                defaultValue={funding}
                onChange={handleChange}
              />
              <Span>DAI</Span>
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
