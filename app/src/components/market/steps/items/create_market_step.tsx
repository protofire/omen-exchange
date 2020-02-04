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
import { Loading } from '../../../common/loading'
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
import { FormError } from '../../../common/form_error'
import { useSelector, useDispatch } from 'react-redux'
import { fetchAccountBalance } from '../../../../store/reducer'

const logger = getLogger('MarketCreationItems::CreateMarketStep')

const OutcomeInfo = styled(Well)`
  margin-bottom: 30px;
`

const ButtonLinkStyled = styled(ButtonLink)`
  margin-right: auto;
`

const ErrorStyled = styled(FormError)`
  margin: 0 0 10px 0;
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

const TitleValueFinalStyled = styled(TitleValue)`
  margin-bottom: 25px;
`

const SubsectionTitleNoMargin = styled(SubsectionTitle)`
  margin-bottom: 0;
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
}

const CreateMarketStep = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { library: provider, account } = context

  const { values, marketCreationStatus } = props
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
      props.submit()
    } catch (err) {
      logger.error(err)
    }
  }

  const resolutionDate = resolution && formatDate(resolution)

  const buttonText = account ? 'Create' : 'Connect Wallet'
  const balance = useSelector((state: any) => state.balance && new BigNumber(state.balance))
  const dispatch = useDispatch()

  const hasEnoughBalance = balance && balance.gte(funding)
  let fundingErrorMessage = ''
  if (balance && !hasEnoughBalance) {
    fundingErrorMessage = `You entered ${formatBigNumber(
      funding,
      collateral.decimals,
    )} DAI of funding but your account only has ${formatBigNumber(
      balance,
      collateral.decimals,
    )} DAI`
  }

  React.useEffect(() => {
    dispatch(fetchAccountBalance(account, provider, collateral))
  }, [account, provider, collateral])

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
      <TitleValueFinalStyled
        title={'Arbitrator'}
        value={<DisplayArbitrator arbitrator={arbitrator} />}
      />
      <SubsectionTitleNoMargin>Outcomes</SubsectionTitleNoMargin>
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
      {!MarketCreationStatus.is.ready(marketCreationStatus) &&
      !MarketCreationStatus.is.error(marketCreationStatus) ? (
        <Loading full={true} message={`${marketCreationStatus._type}...`} />
      ) : null}

      {fundingErrorMessage && <ErrorStyled>{fundingErrorMessage}</ErrorStyled>}
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
            !(
              MarketCreationStatus.is.ready(marketCreationStatus) &&
              !MarketCreationStatus.is.error(marketCreationStatus) &&
              hasEnoughBalance
            ) && !!account
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
