import React from 'react'
import { BigNumber } from 'ethers/utils'
import styled from 'styled-components'

import { Button } from '../../../common/index'
import { ButtonContainer } from '../../../common/button_container'
import { ButtonLink } from '../../../common/button_link'
import { Well } from '../../../common/well'
import { CreateCard } from '../../../common/create_card'
import { Arbitrator, Token } from '../../../../util/types'
import { Paragraph } from '../../../common/paragraph'
import { FullLoading } from '../../../common/full_loading'
import { Table, TD, TH, THead, TR } from '../../../common/table'
import { TitleValue } from '../../../common/title_value'
import { SubsectionTitle } from '../../../common/subsection_title'
import { Outcome } from '../../../common/outcomes'
import { formatBigNumber, formatDate } from '../../../../util/tools'
import { DisplayArbitrator } from '../../../common/display_arbitrator'
import { useConnectedWeb3Context } from '../../../../hooks/connectedWeb3'
import { ButtonType } from '../../../../common/button_styling_types'
import { MarketCreationStatus } from '../../../../util/market_creation_status_data'
import { getLogger } from '../../../../util/logger'
import { ERC20Service } from '../../../../services'

const logger = getLogger('MarketCreationItems::CreateMarketStep')

const OutcomeInfo = styled(Well)`
  margin-bottom: 30px;
`

const ButtonLinkStyled = styled(ButtonLink)`
  margin-right: auto;
`

const Grid = styled.div`
  display: grid;
  grid-column-gap: 20px;
  grid-row-gap: 14px;
  grid-template-columns: 1fr 1fr;
  margin-bottom: 14px;
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
    arbitrator: Arbitrator
    spread: number
    funding: BigNumber
    outcomes: Outcome[]
  }
  marketCreationStatus: MarketCreationStatus
  questionId: string | null
  marketMakerAddress: string | null
}

const CreateMarketStep = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { library: provider, account } = context

  const { marketMakerAddress, values, marketCreationStatus, questionId } = props
  const {
    collateral,
    question,
    category,
    arbitrator,
    resolution,
    spread,
    funding,
    outcomes,
  } = values

  const back = () => {
    props.back()
  }

  const submit = async () => {
    try {
      if (account) {
        const collateralService = new ERC20Service(provider, account, collateral.address)

        const hasEnoughBalanceToFund = await collateralService.hasEnoughBalanceToFund(
          account,
          funding,
        )
        if (!hasEnoughBalanceToFund) {
          throw new Error('there are not enough collateral balance for funding')
        }
      }

      props.submit()
    } catch (err) {
      logger.error(err)
    }
  }

  const resolutionDate = resolution && formatDate(resolution)

  const buttonText = account ? 'Create' : 'Connect Wallet'

  return (
    <CreateCard>
      <OutcomeInfo>
        <Paragraph>
          Please <strong>check all the information is correct</strong>. You can go back and edit
          anything you need.
        </Paragraph>
        <Paragraph>
          <strong>If everything is OK</strong> proceed to create the new market.
        </Paragraph>
      </OutcomeInfo>

      <SubsectionTitle>Details</SubsectionTitle>
      <TitleValueStyled title={'Question'} value={question} />
      <Grid>
        <TitleValue title={'Category'} value={category} />
        <TitleValue title={'Resolution date'} value={resolutionDate} />
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
      <TitleValueStyled
        title={'Arbitrator'}
        value={<DisplayArbitrator arbitrator={arbitrator} />}
      />
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
      {!MarketCreationStatus.is.ready(marketCreationStatus) &&
      !MarketCreationStatus.is.error(marketCreationStatus) ? (
        <FullLoading message={`${marketCreationStatus._type}...`} />
      ) : null}
      <ButtonContainer>
        <ButtonLinkStyled
          disabled={
            !MarketCreationStatus.is.ready(marketCreationStatus) &&
            !MarketCreationStatus.is.error(marketCreationStatus)
          }
          onClick={back}
        >
          ‹ Back
        </ButtonLinkStyled>
        <Button
          buttonType={ButtonType.primary}
          disabled={
            !MarketCreationStatus.is.ready(marketCreationStatus) &&
            !MarketCreationStatus.is.error(marketCreationStatus)
          }
          onClick={submit}
        >
          {buttonText}
        </Button>
      </ButtonContainer>
    </CreateCard>
  )
}

export { CreateMarketStep }
