import React from 'react'
import styled from 'styled-components'
import { CreateCard } from '../../../common/create_card'
import { Button } from '../../../common/index'
import { Outcomes, Outcome } from '../../../common/outcomes'
import { ButtonContainer } from '../../../common/button_container'
import { ButtonLink } from '../../../common/button_link'
import { Well } from '../../../common/well'

const ButtonLinkStyled = styled(ButtonLink)`
  margin-right: auto;
`

const OutcomeInfo = styled(Well)`
  margin-bottom: 30px;
`

interface Props {
  back: () => void
  next: () => void
  values: {
    question: string
    outcomes: Outcome[]
  }
  handleOutcomesChange: (newOutcomes: Outcome[]) => any
}

const OutcomesStep = (props: Props) => {
  const { handleOutcomesChange, values } = props
  const { question, outcomes } = values

  return (
    <CreateCard>
      <OutcomeInfo>
        Please add all the possible outcomes for the <strong>&quot;{question}&quot;</strong>{' '}
        question.
      </OutcomeInfo>
      <Outcomes outcomes={outcomes} onChange={handleOutcomesChange} />
      <ButtonContainer>
        <ButtonLinkStyled onClick={props.back}>‹ Back</ButtonLinkStyled>
        <Button onClick={props.next}>Next</Button>
      </ButtonContainer>
    </CreateCard>
  )
}

export { OutcomesStep }
