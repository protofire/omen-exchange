import React from 'react'
import { BigNumber } from 'ethers/utils'
import styled from 'styled-components'

import { Button } from '../../../common/index'
import { ButtonContainer } from '../../../common/button_container'
import { ButtonLink } from '../../../common/button_link'
import { CreateCard } from '../../../common/create_card'
import { StatusMarketCreation, Token } from '../../../../util/types'
import { Paragraph } from '../../../common/paragraph'
import { FullLoading } from '../../../common/full_loading'
import { Table, TD, TH, THead, TR } from '../../../common/table'
import { TitleValue } from '../../../common/title_value'
import { SubsectionTitle } from '../../../common/subsection_title'
import { Outcome } from '../../../common/outcomes'
import { knownArbitrators } from '../../../../util/addresses'
import { formatBigNumber, formatDate } from '../../../../util/tools'

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
    collateral: Token
    question: string
    category: string
    resolution: Date | null
    arbitratorId: KnownArbitrator
    spread: string
    funding: BigNumber
    outcomes: Outcome[]
  }
  status: StatusMarketCreation
  questionId: string | null
  marketMakerAddress: string | null
}

const CreateMarketStep = (props: Props) => {
  const { marketMakerAddress, values, status, questionId } = props
  const {
    collateral,
    question,
    category,
    arbitratorId,
    resolution,
    spread,
    funding,
    outcomes,
  } = values

  const back = () => {
    props.back()
  }

  const submit = () => {
    props.submit()
  }

  const arbitrator = knownArbitrators[arbitratorId]

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
          title={'Arbitrator'}
          value={[
            <a href={arbitrator.url} key={1} rel="noopener noreferrer" target="_blank">
              {arbitrator.name}
            </a>,
            ' oracle as final arbitrator.',
          ]}
        />
        <TitleValue title={'Spread / Fee'} value={`${spread}%`} />
        {collateral && (
          <TitleValue
            title={'Funding'}
            value={[
              formatBigNumber(funding, collateral.decimals),
              <strong key="1"> {collateral.symbol}</strong>,
            ]}
          />
        )}
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
          <TD>{outcomes[0].name}</TD>
          <TD textAlign="right">{outcomes[0].probability}%</TD>
        </TR>
        <TR>
          <TD>{outcomes[1].name}</TD>
          <TD textAlign="right">{outcomes[1].probability}%</TD>
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
            {marketMakerAddress ? (
              <TitleValue title={'Market Maker'} value={`Deployed at ${marketMakerAddress}`} />
            ) : null}
          </Grid>
        </>
      ) : null}
      {status !== StatusMarketCreation.Ready && status !== StatusMarketCreation.Error ? (
        <FullLoading message={`${status}...`} />
      ) : null}
      <ButtonContainer>
        <ButtonLinkStyled
          disabled={status !== StatusMarketCreation.Ready && status !== StatusMarketCreation.Error}
          onClick={back}
        >
          ‹ Back
        </ButtonLinkStyled>
        <Button
          disabled={status !== StatusMarketCreation.Ready && status !== StatusMarketCreation.Error}
          onClick={submit}
        >
          Finish
        </Button>
      </ButtonContainer>
    </CreateCard>
  )
}

export { CreateMarketStep }
