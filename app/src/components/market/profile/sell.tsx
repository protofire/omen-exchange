import React from 'react'
import styled from 'styled-components'

import { Button } from '../../common'

interface Props {
  handleBack: () => void
  handleFinish: () => void
}

const DivStyled = styled.div`
  width: 5px;
  height: auto;
  display: inline-block;
`

const Sell = (props: Props) => {
  return (
    <>
      Sell
      <div className="row right">
        <Button onClick={() => props.handleBack()}>Back</Button>
        <DivStyled />
        <Button onClick={() => props.handleFinish()}>Finish</Button>
      </div>
    </>
  )
}

export { Sell }
