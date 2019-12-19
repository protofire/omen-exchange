import React, { ChangeEvent } from 'react'
import styled from 'styled-components'
import { CreateCard } from '../../../common/create_card'
import { Button, Textfield, Categories } from '../../../common/index'
import { FormRow } from '../../../common/form_row'
import { DateField } from '../../../common/date_field'
import { ButtonContainer } from '../../../common/button_container'
import { Well } from '../../../common/well'
import { Arbitrators } from '../../../common/arbitrators'
import { knownArbitrators } from '../../../../util/networks'

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

const AskQuestionStep = (props: Props) => {
  const { values, handleChange, handleChangeDate, next } = props
  const { question, category, resolution, arbitratorId } = values
  const arbitrator = knownArbitrators[arbitratorId]

  const error = !question || !category || !resolution

  const validate = (e: any) => {
    e.preventDefault()

    if (!error) {
      next()
    }
  }

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
        tooltip={{
          id: `question`,
          description: `Ensure that your market is phrased in a way that it can be unambiguous, resolvable, contains all the necessary parameters and is clearly understandable. As a guide you could use the <a target="_blank" href="https://augur.guide/2-market-creators/checksheet.html">check sheet</a> prepared by Augur for creating markets.`,
        }}
      />
      <FormRow
        formField={<Categories name="category" value={category} onChange={handleChange} />}
        title={'Category'}
        tooltip={{
          id: `category`,
          description: `You can choose among several categories. Your selection will classify the subject/topic of your market.`,
        }}
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
        tooltip={{
          id: `resolution`,
          description: `Precisely indicate when the market is resolved. The time is displayed in ISO 8601 format.`,
        }}
      />
      <FormRowOracle
        formField={<Arbitrators name="arbitratorId" value={arbitratorId} onChange={handleChange} />}
        title={'Arbitrator'}
        tooltip={{
          id: `arbitrator`,
          description: `If you want to learn how <a target="_blank" href="https://realit.io">realit.io</a> and <a target="_blank" href="https://kleros.io">Kleros</a> work, please visit their websites.
`,
        }}
      />
      <OracleInfo>
        The market will be resolved using{' '}
        <a href={arbitrator.url} rel="noopener noreferrer" target="_blank">
          {arbitrator.name}
        </a>{' '}
        as final arbitrator.
      </OracleInfo>
      <ButtonContainer>
        <Button disabled={error} onClick={validate}>
          Next
        </Button>
      </ButtonContainer>
    </CreateCard>
  )
}

export { AskQuestionStep }
