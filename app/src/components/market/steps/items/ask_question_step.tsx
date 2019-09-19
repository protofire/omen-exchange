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
const PWarn = styled.p`
  color: red;
`

class AskQuestionStep extends Component<Props, State> {
  public state: State = {
    errors: [],
  }

  public validate = (e: any) => {
    e.preventDefault()

    const { values } = this.props
    const { question, category, resolution } = values

    if (!question || !category || !resolution) {
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
    const { values, handleChange, handleChangeDate } = this.props
    const { question, category, resolution } = values
    return (
      <>
        {this.state.errors.length > 0 && (
          <PWarn>
            <i>{this.state.errors.join('. ')}</i>
          </PWarn>
        )}
        <div className="row">
          <div className="col">
            <label>Question *</label>
            <Div>
              <Textfield
                type="text"
                name="question"
                defaultValue={question}
                onChange={handleChange}
              />
            </Div>
            <p>
              <i>
                For example: &quot;Will France win?&quot; is not an acceptable question, but
                &quot;Will France win the 2022 FIFA World Cup&quot; is.
              </i>
            </p>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <label>Categories *</label>
            <Div>
              <Categories name="category" value={category} onChange={handleChange} />
            </Div>
          </div>
          <div className="col">
            <label>Resolution Date *</label>
            <Div>
              <DatePicker name="resolution" selected={resolution} onChange={handleChangeDate} />
            </Div>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <label>Oracle</label>
            <p>
              <i>
                The market is resolved using realit.io oracle using the dxDAO as final arbitrator.
              </i>
            </p>
          </div>
        </div>
        <div className="row">
          <div className="col right">
            <Button onClick={this.validate}>Next</Button>
          </div>
        </div>
      </>
    )
  }
}

export { AskQuestionStep }
