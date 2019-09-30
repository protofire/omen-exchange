import React from 'react'
import { CreateCard } from '../../create_card'
import { formatDate } from '../../../../util/tools'
import { Paragraph } from '../../../common/paragraph'
import { Table, TD, TH, THead, TR } from '../../../common/table'
import { TitleValue } from '../../../common/title_value'
import { SubsectionTitle } from '../../../common/subsection_title'
import styled from 'styled-components'
import { ButtonContainer } from '../../../common/button_container'
import { ButtonCSS } from '../../../common/button'
import { SectionTitle } from '../../../common/section_title'
import { CopyText } from '../../../common/copy_text'

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
  marketMakerAddress: string | null
}

const SummaryMarketStep = (props: Props) => {
  const { marketMakerAddress, values } = props
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
  const marketMakerURL = `${window.location.protocol}//${window.location.hostname}/view/${marketMakerAddress}`

  return (
    <>
      <SectionTitle title="Conditional Exchange" subTitle="Your new market has been created!" />
      <CreateCard>
        <Paragraph>
          This is the URL to access the market. <strong>Be careful and don’t lose it</strong>,
          there’s currently no way to retrieve it if lost:
        </Paragraph>
        <Paragraph>
          <a target="_blank" rel="noopener noreferrer" href={`/view/${marketMakerAddress}`}>
            {marketMakerURL}
          </a>
          <CopyText value={marketMakerURL} />
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
        <ButtonContainer>
          <MainButton
            rel="noopener noreferrer"
            href={`/view/${marketMakerAddress}`}
            target="_blank"
          >
            Go to Market
          </MainButton>
        </ButtonContainer>
      </CreateCard>
    </>
  )
}

export { SummaryMarketStep }
