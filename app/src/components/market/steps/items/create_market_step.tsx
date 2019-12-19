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
import { getArbitrator } from '../../../../util/addresses'
import { formatBigNumber, formatDate } from '../../../../util/tools'
import { DisplayArbitrator } from '../../../common/display_arbitrator'
import { useConnectedWeb3Context } from '../../../../hooks/connectedWeb3'
import { ButtonType } from '../../../../common/button_styling_types'

const ButtonLinkStyled = styled(ButtonLink)`
  margin-right: auto;
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
  const context = useConnectedWeb3Context()

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

  const arbitrator = getArbitrator(context.networkId, arbitratorId)

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
        <TitleValue title={'Arbitrator'} value={<DisplayArbitrator arbitrator={arbitrator} />} />
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
      <Table
        head={
          <THead>
            <TR>
              <TH>Outcome</TH>
              <TH textAlign="right">Probabilities</TH>
            </TR>
          </THead>
        }
        maxHeight="130px"
      >
        {outcomes.map((outcome, index) => {
          return (
            <TR key={index}>
              <TD>{outcome.name}</TD>
              <TD textAlign="right">{outcome.probability}%</TD>
            </TR>
          )
        })}
      </Table>
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
          buttonType={ButtonType.primary}
          disabled={status !== StatusMarketCreation.Ready && status !== StatusMarketCreation.Error}
          onClick={submit}
        >
          Create
        </Button>
      </ButtonContainer>
    </CreateCard>
  )
}

export { CreateMarketStep }
