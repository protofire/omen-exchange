import React, { ChangeEvent, Component } from 'react'
import { debounce } from 'lodash'
import styled from 'styled-components'
import { Textfield } from '../index'

interface Outcome {
  value: string
  name: string
  probability: string
}

interface Props {
  outcomes: Outcome[]
  handleChange: (event: ChangeEvent<HTMLInputElement>) => any
}

interface State {
  outcomes: Outcome[]
}

const Div = styled.div`
  height: 50px;
  display: flex;
  align-items: center;
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

class Outcomes extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    const { outcomes } = props
    this.state = {
      outcomes,
    }

    this.onChangeDebounced = debounce(this.onChangeDebounced, 750)
  }

  public onChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.persist()

    if (+event.target.value < 0) {
      event.target.value = '0'
    }
    if (+event.target.value > 100) {
      event.target.value = '100'
    }

    const outcomes = this.state.outcomes.map((outcome: Outcome) => {
      if (outcome.name === event.target.name) {
        outcome.probability = event.target.value
      }
      return outcome
    })

    this.setState({
      outcomes,
    })

    this.props.handleChange(event)

    // Execute the debounced onChange method
    this.onChangeDebounced(event)
  }

  public onChangeDebounced = (event: ChangeEvent<HTMLInputElement>) => {
    const outcomes = this.state.outcomes.map((outcome: Outcome) => {
      if (
        outcome.name !== event.target.name &&
        (+outcome.probability === 0 || !outcome.probability)
      ) {
        const probability = `${100 - +event.target.value}`
        outcome.probability = probability
        event.target.value = probability
        this.props.handleChange(event)
      }
      return outcome
    })

    this.setState({
      outcomes,
    })
  }

  render() {
    const { outcomes } = this.state

    const outcomesToRender = outcomes.map((outcome: Outcome, index) => (
      <div className="row" key={index}>
        <div className="col left">
          <p>{outcome.value}</p>
        </div>
        <div className="col">
          <Div>
            <InputStyled
              name={outcome.name}
              type="number"
              value={outcome.probability}
              onChange={e => this.onChange(e)}
            />
            <Span>%</Span>
          </Div>
        </div>
      </div>
    ))

    return (
      <>
        <div className="row">
          <div className="col left">
            <label>Outcome</label>
          </div>
          <div className="col left">
            <label>Probability *</label>
          </div>
        </div>
        {outcomesToRender}
      </>
    )
  }
}

export { Outcomes }
