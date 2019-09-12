import React, { ChangeEvent, Component } from 'react'
import DatePicker from 'react-datepicker'
import styled from 'styled-components'

import { Button, Textfield, Categories } from '../../../common/index'

interface Props {
  next: () => void
  values: {
    question: string
    category: string
    resolution: Date | null
  }
  handleChange: (event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => any
  handleChangeDate: (date: Date | null) => any
}

interface State {
  errors: string[]
}

const Div = styled.div`
  height: 50px;
  display: flex;
  align-items: center;
`

class FirstStep extends Component<Props, State> {
  public state: State = {
    errors: [],
  }

  constructor(props: Props) {
    super(props)
    this.validate = this.validate.bind(this)
  }

  public validate(e: any): void {
    e.preventDefault()

    const { values } = this.props
    const { question, category, resolution } = values

    const errors = []
    if (!question || !category || !resolution) {
      errors.push(`Please check the required fields`)
      this.setState({
        errors,
      })
    } else {
      this.props.next()
    }
  }

  render() {
    const { values, handleChange, handleChangeDate } = this.props
    const { question, category, resolution } = values
    return (
      <>
        {this.state.errors.length > 0 && <p>{this.state.errors.join('. ')}</p>}
        <Div>
          <label>Question *</label>
          <Textfield type="text" name="question" defaultValue={question} onChange={handleChange} />
        </Div>
        <Div>
          <label>Categories *</label>
          <Categories name="category" value={category} onChange={handleChange} />
        </Div>
        <Div>
          <label>Resolution Date *</label>
          <DatePicker name="resolution" selected={resolution} onChange={handleChangeDate} />
        </Div>
        <Div>
          <label>
            Oracle: The market is resolved using realit.io oracle using the dxDAO as final
            arbitrator
          </label>
        </Div>

        <Button onClick={this.validate}>Next</Button>
      </>
    )
  }
}

export { FirstStep }
