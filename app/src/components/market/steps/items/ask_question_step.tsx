import React, { ChangeEvent, Component } from 'react'
import styled from 'styled-components'
import { CreateCard } from '../../../common/create_card'
import { Button, Textfield, Categories } from '../../../common/index'
import { FormRow } from '../../../common/form_row'
import { DateField } from '../../../common/date_field'
import { ButtonContainer } from '../../../common/button_container'
import { Well } from '../../../common/well'
import { Arbitrators } from '../../../common/arbitrators'
import { knownArbitrators } from '../../../../util/addresses'

interface Props {
  next: () => void
  values: {
    question: string
    category: string
    resolution: Date | null
    arbitratorId: KnownArbitrator
  }
  handleChange: (event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => any
  handleChangeDate: (date: Date | null) => any
}

interface State {
  errors: string[]
}

const OracleInfo = styled(Well)`
  font-style: italic;
  text-align: center;
`

const FormRowResolutionDate = styled(FormRow)`
  position: relative;
  z-index: 15;
`

const FormRowOracle = styled(FormRow)`
  position: relative;
  z-index: 5;
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
    const { question, category, resolution, arbitratorId } = values

    const arbitrator = knownArbitrators[arbitratorId]

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
        <FormRowResolutionDate
          formField={
            <DateField
              minDate={new Date()}
              name="resolution"
              onChange={handleChangeDate}
              selected={resolution}
            />
          }
          title={'Resolution Date'}
          tooltipText={'Indicate when the market will close.'}
        />
        <FormRowOracle
          formField={
            <Arbitrators name="arbitratorId" value={arbitratorId} onChange={handleChange} />
          }
          title={'Arbitrator'}
          tooltipText={
            'You can choose among several available Arbitrators. The Arbitrator will resolve the market once the Resolution Date is reached.'
          }
        />
        <OracleInfo>
          The market will be resolved using{' '}
          <a href={arbitrator.url} rel="noopener noreferrer" target="_blank">
            {arbitrator.name}
          </a>{' '}
          as final arbitrator.
        </OracleInfo>
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
