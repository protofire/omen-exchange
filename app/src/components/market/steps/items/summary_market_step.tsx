import React from 'react'
import styled from 'styled-components'

import { CreateCard } from '../../../common/create_card'
import { formatBigNumber, formatDate } from '../../../../util/tools'
import { Paragraph } from '../../../common/paragraph'
import { Table, TD, TH, THead, TR } from '../../../common/table'
import { TitleValue } from '../../../common/title_value'
import { SubsectionTitle } from '../../../common/subsection_title'
import { ButtonContainer } from '../../../common/button_container'
import { SectionTitle } from '../../../common/section_title'
import { CopyText } from '../../../common/copy_text'
import { useConnectedWeb3Context } from '../../../../hooks/connectedWeb3'
import { useMarketMakerData } from '../../../../hooks/useMarketMakerData'
import { useQuestion } from '../../../../hooks/useQuestion'
import { FullLoading } from '../../../common/full_loading'
import { NavLink } from 'react-router-dom'
import { DisplayArbitrator } from '../../../common/display_arbitrator'
import { ButtonAnchor } from '../../../common/button_anchor'
import { MARKET_FEE } from '../../../../common/constants'

const NavLinkStyled = styled(NavLink)`
  color: ${props => props.theme.colors.textColor};
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
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

const Button = styled(ButtonAnchor)`
  flex-grow: 1;
`

interface Props {
  marketMakerAddress: string
}

const SummaryMarketStep = (props: Props) => {
  const context = useConnectedWeb3Context()

  const { marketMakerAddress } = props

  const { question, resolution, category } = useQuestion(marketMakerAddress, context)
  const { marketMakerData } = useMarketMakerData(marketMakerAddress, context)
  const { marketMakerFunding, collateral, arbitrator, balances } = marketMakerData

  const resolutionDate = resolution && formatDate(resolution)
  const marketMakerURL = `${window.location.protocol}//${window.location.hostname}/#/${marketMakerAddress}`

  if (!collateral || !arbitrator) {
    return <FullLoading />
  }

  return (
    <>
      <SectionTitle title="Conditional Exchange" subTitle="Your new market has been created!" />
      <CreateCard>
        <SubsectionTitle>Market&apos;s URL</SubsectionTitle>
        <Paragraph>
          You can access your markets from the <NavLinkStyled to="/">Markets</NavLinkStyled>{' '}
          section.
        </Paragraph>
        <Paragraph>
          <a target="_blank" rel="noopener noreferrer" href={`/#/${marketMakerAddress}`}>
            {marketMakerURL}
          </a>
          <CopyText value={marketMakerURL} />
        </Paragraph>
        <SubsectionTitle>Details</SubsectionTitle>
        <TitleValueStyled title={'Question'} value={question} />
        <Grid>
          <TitleValue title={'Category'} value={category} />
          <TitleValue title={'Resolution date'} value={resolutionDate} />
          <TitleValue title={'Arbitrator'} value={<DisplayArbitrator arbitrator={arbitrator} />} />
          <TitleValue title={'Spread / Fee'} value={`${MARKET_FEE}%`} />
          <TitleValue
            title={'Funding'}
            value={[
              formatBigNumber(marketMakerFunding, collateral.decimals),
              <strong key="1"> {collateral.symbol}</strong>,
            ]}
          />
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
          <Button rel="noopener noreferrer" href={`/#/${marketMakerAddress}`} target="_blank">
            View Market
          </Button>
        </ButtonContainer>
      </CreateCard>
    </>
  )
}

export { SummaryMarketStep }
