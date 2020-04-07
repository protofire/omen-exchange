import React, { ChangeEvent, HTMLAttributes, useMemo, useState } from 'react'
import styled from 'styled-components'

import { useAsyncDerivedValue, useContracts } from '../../../hooks'
import { ConnectedWeb3Context } from '../../../hooks/connectedWeb3'
import { getArbitratorFromAddress } from '../../../util/networks'
import { formatDate, truncateStringInTheMiddle } from '../../../util/tools'
import { Arbitrator, Question } from '../../../util/types'
import { Button } from '../../button'
import { ButtonType } from '../../button/button_styling_types'
import { FormLabel, FormRow, Spinner, Textfield, TitleValue } from '../../common'
import { ModalWrapper } from '../../modal/modal_wrapper'

const ButtonStyled = styled(Button)`
  margin-top: 80px;
`

const SubsectionTitleStyled = styled(FormLabel)`
  margin-bottom: 20px;
`

const GridOneColumn = styled.div`
  column-gap: 20px;
  display: grid;
  grid-template-columns: 1fr;
`

const TitleValueStyled = styled(TitleValue)`
  display: flex;
  margin-bottom: 10px;

  > p {
    margin-left: 5px;
  }
`

const SpinnerStyled = styled(Spinner)`
  margin-left: 136px;
  margin-top: 50px;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  context: ConnectedWeb3Context
  isOpen: boolean
  onClose: () => void
  onSave: (question: Question, arbitrator: Arbitrator) => void
}

export const ModalQuestion = (props: Props) => {
  const { context, isOpen, onClose, onSave } = props

  const { realitio } = useContracts(context)

  const [questionURL, setQuestionURL] = useState<string>('')
  const [isSpinnerOn, setSpinnerOn] = useState<boolean>(false)

  const extractId = (questionURL: string): string => {
    const reQuestionId = /question\/(0x[0-9A-Fa-f]{64})/
    if (!questionURL) return ''
    const questionMatch = questionURL.match(reQuestionId)
    return questionMatch ? questionMatch[1] : ''
  }

  const fetchQuestion = useMemo(
    () => async (): Promise<[Maybe<Question>, Maybe<Arbitrator>, Maybe<string>]> => {
      const questionId = extractId(questionURL)
      if (!questionId) {
        return [null, null, null]
      }

      setSpinnerOn(true)
      try {
        const question = await realitio.getQuestion(questionId)
        const arbitrator = getArbitratorFromAddress(context.networkId, question.arbitratorAddress)
        setSpinnerOn(false)
        return [question, arbitrator, null]
      } catch (err) {
        setSpinnerOn(false)
        return [null, null, `No data found for question ID ${questionId}`]
      }
    },
    [questionURL, realitio, context],
  )

  const [question, arbitrator, errorMessage] = useAsyncDerivedValue('', [null, null, null], fetchQuestion)

  const validQuestion = !!question && !errorMessage

  const onClickSaveButton = () => {
    if (validQuestion) {
      if (question && arbitrator) onSave(question, arbitrator)
      onClose()
    }
  }

  const spinner = () => {
    return isSpinnerOn && <SpinnerStyled height={'25px'} width={'25px'} />
  }

  const questionDetails = () => {
    return (
      validQuestion && (
        <>
          <SubsectionTitleStyled>Details</SubsectionTitleStyled>
          <GridOneColumn>
            {question && <TitleValueStyled title={'Question:'} value={question.title} />}
            {question && <TitleValueStyled title={'Category:'} value={question.category} />}
            {question && question.resolution && (
              <TitleValueStyled title={'Resolution:'} value={formatDate(question.resolution)} />
            )}
            {question && (
              <TitleValueStyled
                title={'Arbitrator:'}
                value={
                  <span title={`Name: ${arbitrator && arbitrator.name} - Address: ${question.arbitratorAddress}`}>
                    {truncateStringInTheMiddle(question.arbitratorAddress, 6, 4)}
                  </span>
                }
              />
            )}
          </GridOneColumn>
        </>
      )
    )
  }

  return (
    <ModalWrapper isOpen={isOpen} onRequestClose={onClose} title={`Add question from realit.io`}>
      <FormRow
        error={errorMessage || ''}
        formField={
          <Textfield
            hasError={!!errorMessage}
            hasSuccess={validQuestion}
            name="questionURL"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const { value } = event.target
              setQuestionURL(value.trim())
            }}
            placeholder="https://realitio.github.io/#!/question/0xd27a6a4dbc3930b0e319aad2c7b2c478fa9d8ff785f474415bdec1285838b3e9"
            type="text"
          />
        }
        style={{ marginTop: '20px' }}
        title={'Question URL'}
      />
      {questionDetails()}
      {spinner()}
      <ButtonStyled buttonType={ButtonType.primary} disabled={!validQuestion} onClick={onClickSaveButton}>
        Add
      </ButtonStyled>
    </ModalWrapper>
  )
}
