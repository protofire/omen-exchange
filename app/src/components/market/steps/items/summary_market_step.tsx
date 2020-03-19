import React from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

import { MARKET_FEE } from '../../../../common/constants'
import { useMarketMakerData, useQuestion } from '../../../../hooks'
import { useConnectedWeb3Context } from '../../../../hooks/connectedWeb3'
import { ButtonType } from '../../../../theme/component_styles/button_styling_types'
import { formatBigNumber, formatDate } from '../../../../util/tools'
import {
  ButtonAnchor,
  ButtonContainer,
  CopyText,
  CreateCard,
  DisplayArbitrator,
  Paragraph,
  SectionTitle,
  SubsectionTitle,
  TD,
  TH,
  THead,
  TR,
  Table,
  TitleValue,
  Well,
} from '../../../common'
import { FullLoading } from '../../../loading'

const NavLinkStyled = styled(NavLink)`
  color: ${props => props.theme.colors.textColor};
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
`
const OutcomeInfo = styled(Well)`
  margin-bottom: 30px;
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

const TitleValueFinalStyled = styled(TitleValue)`
  margin-bottom: 25px;
`

const Button = styled(ButtonAnchor)`
  flex-grow: 1;
`

const SubsectionTitleNoMargin = styled(SubsectionTitle)`
  margin-bottom: 0;
`

interface Props {
  marketMakerAddress: string
}

const SummaryMarketStep = (props: Props) => {
  const context = useConnectedWeb3Context()

  const { marketMakerAddress } = props

  const { category, question, resolution } = useQuestion(marketMakerAddress, context)
  const { marketMakerData } = useMarketMakerData(marketMakerAddress, context)
  const { arbitrator, balances, collateral, marketMakerFunding } = marketMakerData

  const resolutionDate = resolution && formatDate(resolution)
  const marketMakerURL = `${window.location.protocol}//${window.location.hostname}/#/${marketMakerAddress}`

  if (!collateral || !arbitrator) {
    return <FullLoading />
  }

  return (
    <>
      <SectionTitle title="Conditional Exchange" />
      <CreateCard>
        <OutcomeInfo>
          <Paragraph>
            You can now find your market on the <NavLinkStyled to="/">Markets</NavLinkStyled> section.
          </Paragraph>
          <Paragraph>
            Get the URL to your market
            <CopyText toastMessage="URL copied to your clipboard!" value={marketMakerURL} />
          </Paragraph>
        </OutcomeInfo>
        <SubsectionTitle>Details</SubsectionTitle>
        <TitleValueStyled title={'Question'} value={question} />
        <Grid>
          <TitleValue title={'Category'} value={category} />
          <TitleValue title={'Resolution date'} value={resolutionDate} />
          <TitleValue title={'Spread / Fee'} value={`${MARKET_FEE}%`} />
          <TitleValue
            title={'Funding'}
            value={[
              formatBigNumber(marketMakerFunding, collateral.decimals),
              <strong key="1"> {collateral.symbol}</strong>,
            ]}
          />
        </Grid>
        <TitleValueFinalStyled title={'Arbitrator'} value={<DisplayArbitrator arbitrator={arbitrator} />} />
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
          {balances.map((item, index) => {
            return (
              <TR key={index}>
                <TD>{item.outcomeName}</TD>
                <TD textAlign="right">{item.probability}%</TD>
              </TR>
            )
          })}
        </Table>
        <ButtonContainer>
          <Button
            buttonType={ButtonType.primary}
            href={`/#/${marketMakerAddress}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            View Market
          </Button>
        </ButtonContainer>
      </CreateCard>
    </>
  )
}

export { SummaryMarketStep }
