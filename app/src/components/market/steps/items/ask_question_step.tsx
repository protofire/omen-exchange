import React, { ChangeEvent, Component } from 'react'
import styled from 'styled-components'
import { CreateCard } from '../../create_card'
import { Button, Textfield, Categories } from '../../../common/index'
import { FormRow } from '../../../common/form_row'
import { DateField } from '../../../common/date_field'
import { TimeField } from '../../../common/time_field'
import { ButtonContainer } from '../../../common/button_container'

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

const TwoColumnsRow = styled.div`
  column-gap: 17px;
  display: grid;
  grid-template-columns: 1fr 1fr;
`

const OracleInfo = styled.div`
  background-color: #f6f6f6;
  border-radius: 3px;
  color: #555;
  font-size: 14px;
  font-style: italic;
  font-weight: normal;
  line-height: 1.36;
  padding: 12px 15px;
  text-align: center;

  a {
    color: #555;
    text-decoration: underline;

    &:hover {
      text-decoration: none;
    }
  }
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
      console.log(errors)
    } else {
      this.props.next()
    }
  }

  render() {
    const { values, handleChange, handleChangeDate } = this.props
    const { question, category, resolution } = values

    return (
      <CreateCard>
        <FormRow
          formField={
            <Textfield
              defaultValue={question}
              name="question"
              onChange={handleChange}
              placeholder="Type in a question..."
              type="text"
            />
          }
          note={[
            <strong key="1">For example:</strong>,
            ' ',
            <i key="2">&quot;Will France win?&quot;</i>,
            ' is not an acceptable question, but ',
            <i key="3">&quot;Will France win the 2020 FIFA World Cup?&quot;</i>,
            ' is a good one.',
          ]}
          title={'Question'}
          tooltipText={'It must be an unambiguous question.'}
        />
        <FormRow
          formField={<Categories name="category" value={category} onChange={handleChange} />}
          title={'Category'}
          tooltipText={'You can choose among several available categories.'}
        />
        <FormRow
          formField={
            <TwoColumnsRow>
              <DateField
                minDate={new Date()}
                name="resolution"
                onChange={handleChangeDate}
                selected={resolution}
              />
              <TimeField name="markettime" />
            </TwoColumnsRow>
          }
          title={'Resolution Date'}
          tooltipText={'Indicate when the market will close.'}
        />
        <FormRow
          formField={
            <OracleInfo>
              The market will be resolved using the{' '}
              <a href="https://realit.io/" rel="noopener noreferrer" target="_blank">
                realit.io
              </a>{' '}
              oracle and using{' '}
              <a href="https://dxdao.daostack.io/" rel="noopener noreferrer" target="_blank">
                dxDAO
              </a>{' '}
              as final arbitrator.
            </OracleInfo>
          }
          title={'Oracle'}
          tooltipText={'The Oracle will resolve the market once the Resolution Date is reached.'}
        />
        <ButtonContainer>
          <Button disabled={!question || !category || !resolution} onClick={this.validate}>
            Next
          </Button>
        </ButtonContainer>
      </CreateCard>
    )
  }
}

export { AskQuestionStep }
