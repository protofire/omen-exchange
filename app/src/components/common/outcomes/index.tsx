import React, { ChangeEvent } from 'react'
import styled from 'styled-components'
import { Textfield } from '../index'

interface Outcome {
  value: string
  name: string
  probability: string | number
}

interface Props {
  outcomes: Outcome[]
  onChange: (index: number, event: ChangeEvent<HTMLInputElement>) => any
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

const Outcomes = (props: Props) => {
  const outcomesToRender = props.outcomes.map((outcome: Outcome, index: number) => (
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
            onChange={e => props.onChange(index, e)}
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

export { Outcomes }
