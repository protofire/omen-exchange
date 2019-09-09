import React from 'react'
import styled from 'styled-components'

import { Textfield, Categories, Button } from '../common'
import { useCreateMarket } from './hooks/use_create'

const Div = styled.div`
  height: 50px;
  display: flex;
  align-items: center;
`

export const CreateMarket: React.FC = () => {
  const { values, handleChange, handleSubmit } = useCreateMarket({
    initialValues: {
      question: '',
      category: '',
      resolution: '',
      spreed: '',
      outcomeOne: '',
      outcomeTwo: '',
      outcomeOneProbability: '',
      outcomeTwoProbability: '',
      funding: '',
    },
    onSubmit(values: any, errors: any) {
      alert(JSON.stringify({ values, errors }, null, 2))
    },
    validate(values: any) {
      const errors = { question: '' }

      if (values.question === '') {
        errors.question = 'Please enter a question'
      }

      return errors
    },
  })

  return (
    <form onSubmit={handleSubmit}>
      <Div>
        <label>Question:</label>
        <Textfield type="text" name="question" value={values.question} onChange={handleChange} />
      </Div>
      <Div>
        <label>Categories:</label>
        <Categories name="category" value={values.category} onChange={handleChange} />
      </Div>
      <Div>
        <label>Oracle</label>
        <label>
          The market is resolved using realit.io oracle using the dxDAO as final arbitrator
        </label>
      </Div>
      <Div>
        <label>Resolution</label>
        <Textfield
          type="text"
          name="resolution"
          value={values.resolution}
          onChange={handleChange}
        />
        <label>Spreed/Fee</label>
        <Textfield type="text" name="resolution" value={values.spreed} onChange={handleChange} />
      </Div>
      <Div>
        <label>Outcome</label>
        <Textfield
          type="text"
          name="outcomeOne"
          value={values.outcomeOne}
          onChange={handleChange}
        />
        <Textfield
          type="text"
          name="outcomeTwo"
          value={values.outcomeTwo}
          onChange={handleChange}
        />
        <label>Initial Probability</label>
        <Textfield
          type="text"
          name="outcomeOneProbability"
          value={values.outcomeOneProbability}
          onChange={handleChange}
        />
        <Textfield
          type="text"
          name="outcomeTwoProbability"
          value={values.outcomeTwoProbability}
          onChange={handleChange}
        />
      </Div>
      <Div>
        <label>Funding</label>
        <Textfield type="text" name="funding" value={values.funding} onChange={handleChange} /> DAI
      </Div>

      <Button type="submit">Create market</Button>
    </form>
  )
}
