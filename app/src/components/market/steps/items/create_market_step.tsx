import React, { Component } from 'react'
import { Button } from '../../../common/index'
import { ButtonContainer } from '../../../common/button_container'
import { ButtonLink } from '../../../common/button_link'
import { CreateCard } from '../../create_card'
import { StatusMarketCreation } from '../../../../util/types'
import { Paragraph } from '../../../common/paragraph'
import { FullLoading } from '../../../common/full_loading'
import { Table, TD, TH, THead, TR } from '../../../common/table'
import { TitleValue } from '../../../common/title_value'
import { SubsectionTitle } from '../../../common/subsection_title'
import { formatDate } from '../../../../util/tools'
import styled from 'styled-components'

const ButtonLinkStyled = styled(ButtonLink)`
  margin-right: auto;
`

const TableStyled = styled(Table)`
  margin-bottom: 25px;
`

const Grid = styled.div`
  display: grid;
  grid-column-gap: 20px;
  grid-row-gap: 14px;
  grid-template-columns: 1fr 1fr;
  margin-bottom: 25px;
`

const TitleValueStyled = styled(TitleValue)`
  margin-bottom: 14px;
`

interface Props {
  back: () => void
  submit: () => void
  values: {
    question: string
    category: string
    resolution: Date | null
    spread: string
    funding: string
    outcomeValueOne: string
    outcomeValueTwo: string
    outcomeProbabilityOne: string
    outcomeProbabilityTwo: string
  }
  status: StatusMarketCreation
  questionId: string | null
  marketMakerAddress: string | null
}

class CreateMarketStep extends Component<Props> {
  back = () => {
    this.props.back()
  }

  submit = () => {
    this.props.submit()
  }

  render() {
    const { marketMakerAddress, values, status, questionId } = this.props
    const {
      question,
      category,
      resolution,
      spread,
      funding,
      outcomeValueOne,
      outcomeValueTwo,
      outcomeProbabilityOne,
      outcomeProbabilityTwo,
    } = values

    const resolutionDate = resolution && formatDate(resolution)

    return (
      <CreateCard>
        <Paragraph>
          Please <strong>check all the information is correct</strong>. You can go back and edit
          anything you need.
        </Paragraph>
        <Paragraph>
          <strong>If everything is OK</strong> proceed to create the new market.
        </Paragraph>
        <SubsectionTitle>Details</SubsectionTitle>
        <TitleValueStyled title={'Question'} value={question} />
        <Grid>
          <TitleValue title={'Category'} value={category} />
          <TitleValue title={'Resolution date'} value={resolutionDate} />
          <TitleValue
            title={'Oracle'}
            value={[
              <a href="https://realit.io/" key={1} rel="noopener noreferrer" target="_blank">
                realit.io
              </a>,
              ' oracle and ',
              <a
                href="https://dxdao.daostack.io/"
                key={2}
                rel="noopener noreferrer"
                target="_blank"
              >
                dxDAO
              </a>,
              ' as final arbitrator.',
            ]}
          />
          <TitleValue title={'Spread / Fee'} value={`${spread}%`} />
          <TitleValue title={'Funding'} value={[funding, <strong key="1"> DAI</strong>]} />
        </Grid>
        <SubsectionTitle>Outcomes</SubsectionTitle>
        <TableStyled
          head={
            <THead>
              <TR>
                <TH>Outcome</TH>
                <TH textAlign="right">Probabilities</TH>
              </TR>
            </THead>
          }
        >
          <TR>
            <TD>{outcomeValueOne}</TD>
            <TD textAlign="right">{outcomeProbabilityOne}%</TD>
          </TR>
          <TR>
            <TD>{outcomeValueTwo}</TD>
            <TD textAlign="right">{outcomeProbabilityTwo}%</TD>
          </TR>
        </TableStyled>
        {questionId || marketMakerAddress ? (
          <>
            <SubsectionTitle>Created Market Information</SubsectionTitle>
            <Grid>
              {questionId ? (
                <TitleValue
                  title={'Realitio'}
                  value={[
                    <a
                      href={`https://realitio.github.io/#!/question/${questionId}`}
                      key="1"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Question URL
                    </a>,
                  ]}
                />
              ) : null}
              {marketMakerAddress && (
                <TitleValue title={'Market Maker'} value={`Deployed at ${marketMakerAddress}`} />
              )}
            </Grid>
          </>
        ) : null}
        {status !== StatusMarketCreation.Ready && status !== StatusMarketCreation.Error ? (
          <FullLoading message={`${status}...`} />
        ) : null}
        <ButtonContainer>
          <ButtonLinkStyled
            disabled={
              status !== StatusMarketCreation.Ready && status !== StatusMarketCreation.Error
            }
            onClick={this.back}
          >
            ‹ Back
          </ButtonLinkStyled>
          <Button
            disabled={
              status !== StatusMarketCreation.Ready && status !== StatusMarketCreation.Error
            }
            onClick={this.submit}
          >
            Finish
          </Button>
        </ButtonContainer>
      </CreateCard>
    )
  }
}

export { CreateMarketStep }
