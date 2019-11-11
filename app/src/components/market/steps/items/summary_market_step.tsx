import React from 'react'
import styled from 'styled-components'

import { CreateCard } from '../../../common/create_card'
import { formatBigNumber, formatDate } from '../../../../util/tools'
import { Paragraph } from '../../../common/paragraph'
import { Table, TD, TH, THead, TR } from '../../../common/table'
import { TitleValue } from '../../../common/title_value'
import { SubsectionTitle } from '../../../common/subsection_title'
import { ButtonContainer } from '../../../common/button_container'
import { ButtonCSS } from '../../../common/button'
import { SectionTitle } from '../../../common/section_title'
import { CopyText } from '../../../common/copy_text'
import { useConnectedWeb3Context } from '../../../../hooks/connectedWeb3'
import { useMarketMakerData } from '../../../../hooks/useMarketMakerData'
import { useQuestion } from '../../../../hooks/useQuestion'
import { FullLoading } from '../../../common/full_loading'
import { BalanceItem } from '../../../../util/types'

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

const MainButton = styled.a`
  ${ButtonCSS}
  flex-grow: 1;
  text-decoration: none;
`

interface Props {
  marketMakerAddress: string
}

const SummaryMarketStep = (props: Props) => {
  const context = useConnectedWeb3Context()

  const { marketMakerAddress } = props

  const { question, resolution } = useQuestion(marketMakerAddress, context)
  const { marketMakerFunding, balance, collateral, arbitrator } = useMarketMakerData(
    marketMakerAddress,
    context,
  )

  const resolutionDate = resolution && formatDate(resolution)
  const marketMakerURL = `${window.location.protocol}//${window.location.hostname}/#/${marketMakerAddress}`

  if (!collateral || !arbitrator) {
    return <FullLoading />
  }

  return (
    <>
      <SectionTitle title="Conditional Exchange" subTitle="Your new market has been created!" />
      <CreateCard>
        <Paragraph>
          This is the URL to access the market. <strong>Be careful and don’t lose it</strong>,
          there’s currently no way to retrieve it if lost:
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
          <TitleValue title={'Category'} value={'TODO: Add category'} />
          <TitleValue title={'Resolution date'} value={resolutionDate} />
          <TitleValue
            title={'Oracle'}
            value={[
              <a href={arbitrator.url} key={1} rel="noopener noreferrer" target="_blank">
                {arbitrator.name}
              </a>,
              ' oracle as final arbitrator.',
            ]}
          />
          <TitleValue title={'Spread / Fee'} value={`1%`} />
          <TitleValue
            title={'Funding'}
            value={[
              formatBigNumber(marketMakerFunding, collateral.decimals),
              <strong key="1"> {collateral.symbol}</strong>,
            ]}
          />
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
          {balance.map((item: BalanceItem, index: number) => {
            return (
              <TR key={index}>
                <TD>{item.outcomeName}</TD>
                <TD textAlign="right">{item.probability}%</TD>
              </TR>
            )
          })}
        </TableStyled>
        <ButtonContainer>
          <MainButton rel="noopener noreferrer" href={`/#/${marketMakerAddress}`} target="_blank">
            Go to Market
          </MainButton>
        </ButtonContainer>
      </CreateCard>
    </>
  )
}

export { SummaryMarketStep }
