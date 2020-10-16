import React, { ChangeEvent, HTMLAttributes, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { useAsyncDerivedValue, useContracts, useMarketMakerData } from '../../../../../../hooks'
import { ConnectedWeb3Context } from '../../../../../../hooks/connectedWeb3'
import { useGraphMarketIdFromQuestion } from '../../../../../../hooks/useGraphMarketIdFromQuestion'
import { getArbitratorFromAddress } from '../../../../../../util/networks'
import { formatDate } from '../../../../../../util/tools'
import { Arbitrator, BalanceItem, Question } from '../../../../../../util/types'
import { FormRow, Spinner, SubsectionTitle, Textfield, TitleValue } from '../../../../../common'
import { IconReality } from '../../../../../common/icons'
import {
  OutcomeItemLittleBallOfJoyAndDifferentColors,
  OutcomeItemText,
  OutcomeItemTextWrapper,
  OutcomesTBody,
  OutcomesTD,
  OutcomesTH,
  OutcomesTHead,
  OutcomesTR,
  OutcomesTable,
  OutcomesTableWrapper,
} from '../../../../common/common_styled'
import { DisplayArbitrator } from '../../../../common/display_arbitrator'
import { VerifiedRow } from '../../../../common/verified_row'
import { WarningMessage } from '../../../../common/warning_message'
import { Outcome } from '../outcomes'

const SubsectionTitleStyled = styled(SubsectionTitle)`
  margin-bottom: 20px;
`

const SubTitle = styled.h3`
  color: ${props => props.theme.colors.textColorDarker};
  font-size: 14px;
  line-height: 16px;
  font-weight: normal;
  margin: 0 0 8px 0;
`

const QuestionText = styled.p`
  color: ${props => props.theme.colors.textColor};
  font-size: 14px;
  line-height: 16px;
  font-weight: normal;
  margin: 0 0 20px 0;
`

const SpinnerStyled = styled(Spinner)`
  margin-bottom: 13px;
`

const ContentWrapper = styled.div`
  border: 1px solid ${({ theme }) => theme.borders.borderDisabled};
  border-radius: 8px;
  padding: 21px 25px;
  height: 100%;
  margin-bottom: 20px;
  min-height: 300px;
`

const EmptyWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`

const CommentLabel = styled.div`
  font-size: 14px;
  line-height: 16px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textColorLighter};
  margin-top: 16px;
  & {
    a {
      color: ${({ theme }) => theme.colors.hyperlink};
    }
  }
`

const TitleValueVertical = styled(TitleValue)`
  flex-direction: column;
  justify-content: flex-start;
  text-transform: capitalize;

  > h2 {
    margin: 0 0 10px;
    line-height: 16px;
  }

  > p {
    text-align: left;
    line-height: 16px;
    margin: 0;
  }
`

const FlexRowWrapper = styled.div`
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  & > * + * {
    margin-left: 38px;
  }
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  context: ConnectedWeb3Context
  loadedQuestionId: Maybe<string>
  onSave: (question: Question, arbitrator: Arbitrator, outcomes: Outcome[], verifyLabel?: string) => void
}

export const ImportMarketContent = (props: Props) => {
  const { context, loadedQuestionId, onSave } = props
  const { realitio } = useContracts(context)

  const [state, setState] = useState<{ questionURL: string; loading: boolean }>({
    questionURL: loadedQuestionId ? `http://reality.eth.link/app/#!/question/${loadedQuestionId}` : '',
    loading: false,
  })

  const setQuestionURL = (value: string) => setState(prevState => ({ ...prevState, questionURL: value }))

  const setLoading = (loading: boolean) => setState(prevState => ({ ...prevState, loading }))

  const extractId = (questionURL: string): string => {
    const reQuestionId = /question\/(0x[0-9A-Fa-f]{64})/

    if (!questionURL) return ''

    const questionMatch = questionURL.match(reQuestionId)

    return questionMatch ? questionMatch[1] : ''
  }

  const isWeb3Connected = !!context.account

  const fetchQuestion = useMemo(
    () => async (): Promise<[Maybe<Question>, Maybe<Arbitrator>, Maybe<string>]> => {
      const questionId = extractId(state.questionURL)
      if (!questionId) {
        setLoading(false)
        return [null, null, null]
      }

      setLoading(true)
      try {
        const question = await realitio.getQuestion(questionId)
        const arbitrator = getArbitratorFromAddress(context.networkId, question.arbitratorAddress)
        return [question, arbitrator, null]
      } catch (err) {
        console.warn(err)
        setLoading(false)
        return [null, null, `No data found for question ID ${questionId}`]
      }
    },
    [state.questionURL, realitio, context],
  )

  const [question, arbitrator, errorMessage] = useAsyncDerivedValue('', [null, null, null], fetchQuestion)
  const { marketId } = useGraphMarketIdFromQuestion(question?.id || '')
  const { marketMakerData } = useMarketMakerData((marketId || '').toLowerCase())

  useEffect(() => {
    if (marketMakerData) {
      setLoading(false)
      if (question && arbitrator) {
        const outcomes = marketMakerData.balances.map(
          (balance: BalanceItem) =>
            ({
              name: balance.outcomeName,
              probability: balance.probability,
            } as Outcome),
        )
        const verifyLabel = marketMakerData.curatedByDxDao
          ? 'DXdao'
          : marketMakerData.klerosTCRregistered
          ? 'Kleros'
          : ''
        onSave(question, arbitrator, outcomes, verifyLabel)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketMakerData])

  const validContent = !!question && !errorMessage && !!marketId && !!marketMakerData

  const questionDetails = () => {
    return (
      validContent &&
      question &&
      marketMakerData && (
        <>
          <SubsectionTitleStyled>Categorical Market</SubsectionTitleStyled>
          <div>
            <SubTitle>Question</SubTitle>
            <QuestionText>{question.title}</QuestionText>
          </div>

          <OutcomesTableWrapper borderBottom>
            <OutcomesTable>
              <OutcomesTHead>
                <OutcomesTR>
                  <OutcomesTH style={{ width: '65%' }}>Outcome</OutcomesTH>
                  <OutcomesTH>Probability</OutcomesTH>
                </OutcomesTR>
              </OutcomesTHead>
              <OutcomesTBody>
                {marketMakerData.balances.map((balanceItem: BalanceItem, index) => {
                  const { outcomeName, probability } = balanceItem
                  return (
                    <OutcomesTR key={index}>
                      <OutcomesTD>
                        <OutcomeItemTextWrapper>
                          <OutcomeItemLittleBallOfJoyAndDifferentColors outcomeIndex={index} />
                          <OutcomeItemText>{outcomeName}</OutcomeItemText>
                        </OutcomeItemTextWrapper>
                      </OutcomesTD>
                      <OutcomesTD>{probability.toFixed(2)}%</OutcomesTD>
                    </OutcomesTR>
                  )
                })}
              </OutcomesTBody>
            </OutcomesTable>
          </OutcomesTableWrapper>

          <FlexRowWrapper>
            <TitleValueVertical
              date={new Date(question.resolution)}
              title={'Closing Date (UTC)'}
              tooltip={true}
              value={formatDate(question.resolution, false)}
            />
            <TitleValueVertical title={'Category'} value={question.category} />
            {arbitrator && (
              <TitleValueVertical title={'Arbitrator'} value={<DisplayArbitrator arbitrator={arbitrator} />} />
            )}

            <TitleValueVertical
              title={'Verified by'}
              value={
                <VerifiedRow
                  label={marketMakerData.curatedByDxDao ? 'DXdao' : marketMakerData.klerosTCRregistered ? 'Kleros' : ''}
                />
              }
            />
          </FlexRowWrapper>
        </>
      )
    )
  }

  const renderContent = () => {
    if (validContent) {
      return questionDetails()
    }
    const link = isWeb3Connected ? 'reality.eth' : 'reality.eth.link'
    return (
      <EmptyWrapper>
        {state.loading && (
          <>
            <SpinnerStyled height={'38px'} width={'38px'} />
            <CommentLabel>
              importing market from{' '}
              <a href={`https://${link}`} target="_blink">
                {link}
              </a>
            </CommentLabel>
          </>
        )}
        {!state.loading &&
          (state.questionURL ? (
            <CommentLabel>Market not found</CommentLabel>
          ) : (
            <>
              <IconReality />
              <CommentLabel>
                Import Market from{' '}
                <a href={`https://${link}`} target="_blink">
                  {link}
                </a>
              </CommentLabel>
            </>
          ))}
      </EmptyWrapper>
    )
  }

  const renderWarning = () => {
    if (validContent && question && marketMakerData) {
      if (question.resolution <= new Date()) {
        return (
          <WarningMessage
            description={'Market has an expired closing date and cannot be imported.'}
            style={{ marginBottom: 20, marginTop: -4 }}
          />
        )
      }
      const totalProbabilities = marketMakerData.balances
        .map(balance => balance.probability)
        .reduce((probability1, probability2) => probability1 + probability2)

      if (totalProbabilities !== 100) {
        return (
          <WarningMessage
            description={'Market has outcomes with no probability and cannot be imported.'}
            style={{ marginBottom: 20, marginTop: -4 }}
          />
        )
      }
      return null
    }
    return null
  }

  return (
    <>
      <FormRow
        formField={
          <Textfield
            hasSuccess={validContent}
            name="questionURL"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const { value } = event.target
              setQuestionURL(value.trim())
            }}
            placeholder="https://reality.eth.link/app/#!/..."
            type="text"
            value={state.questionURL}
          />
        }
        style={{ marginTop: '20px' }}
        title={'Set Question URL'}
      />
      <ContentWrapper>{renderContent()}</ContentWrapper>
      {renderWarning()}
    </>
  )
}
