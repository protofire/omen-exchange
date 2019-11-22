import React from 'react'
import styled, { withTheme } from 'styled-components'
import { withRouter, RouteComponentProps } from 'react-router-dom'

import { ThreeBoxComments } from '../../common/three_box_comments'
import { ViewCard } from '../../common/view_card'
import { formatBigNumber } from '../../../util/tools'
import { Status, BalanceItem, Token, Arbitrator } from '../../../util/types'
import { Button, ButtonAnchor } from '../../common'
import { FullLoading } from '../../common/full_loading'
import { ButtonContainer } from '../../common/button_container'
import { Table, TD, TH, THead, TR } from '../../common/table'
import { SubsectionTitle } from '../../common/subsection_title'
import { BigNumber } from 'ethers/utils'
import { TitleValue } from '../../common/title_value'

interface Props extends RouteComponentProps<{}> {
  balance: BalanceItem[]
  collateral: Token
  arbitrator: Maybe<Arbitrator>
  question: string
  questionId: string
  category: string
  status: Status
  theme?: any
  marketMakerAddress: string
  funding: BigNumber
  isQuestionFinalized: boolean
  onResolveCondition: () => Promise<void>
}

const ButtonContainerStyled = styled(ButtonContainer)`
  display: grid;
  grid-row-gap: 10px;
  grid-template-columns: 1fr;

  > a {
    margin-left: 0;
  }

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    grid-template-columns: 1fr 1fr 1fr;

    > a {
      margin-left: 10px;
    }
  }
`
const Grid = styled.div`
  display: grid;
  grid-column-gap: 20px;
  grid-row-gap: 14px;
  grid-template-columns: 1fr 1fr;
  margin-bottom: 25px;
`

const ViewWrapper = (props: Props) => {
  const {
    balance,
    collateral,
    status,
    questionId,
    theme,
    marketMakerAddress,
    arbitrator,
    category,
    isQuestionFinalized,
    onResolveCondition,
  } = props

  const userHasShares = balance.some((balanceItem: BalanceItem) => {
    const { shares } = balanceItem
    return !shares.isZero()
  })

  const headerArray = ['Outcome', 'Probabilities', 'Current Price', 'Shares']
  const cellAlignment = ['left', 'right', 'right', 'right']
  if (!userHasShares) {
    headerArray.pop()
  }

  const renderTableHeader = (): React.ReactNode => {
    return (
      <THead>
        <TR>
          {headerArray.map((value, index) => {
            return (
              <TH key={index} textAlign={cellAlignment[index]}>
                {value}
              </TH>
            )
          })}
        </TR>
      </THead>
    )
  }

  const renderTableData = () => {
    return balance.map((balanceItem: BalanceItem, index: number) => {
      const { outcomeName, probability, currentPrice, shares } = balanceItem
      return (
        <TR key={index}>
          <TD textAlign={cellAlignment[0]}>{outcomeName}</TD>
          <TD textAlign={cellAlignment[1]}>{probability} %</TD>
          <TD textAlign={cellAlignment[2]}>
            {currentPrice} {collateral.symbol}
          </TD>
          {userHasShares && (
            <TD textAlign={cellAlignment[3]}>{formatBigNumber(shares, collateral.decimals)}</TD>
          )}
        </TR>
      )
    })
  }

  const details = () => {
    return (
      <>
        <SubsectionTitle>Details</SubsectionTitle>
        <Grid>
          {category && <TitleValue title={'Category'} value={category} />}
          {arbitrator && (
            <TitleValue
              title={'Arbitrator'}
              value={[
                <a href={arbitrator.url} key={1} rel="noopener noreferrer" target="_blank">
                  {arbitrator.name}
                </a>,
                ' oracle as final arbitrator.',
              ]}
            />
          )}
          {questionId && (
            <TitleValue
              title={'Realitio'}
              value={
                <a
                  href={`https://realitio.github.io/#!/question/${questionId}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Question URL
                </a>
              }
            />
          )}
        </Grid>
      </>
    )
  }

  const marketHasDetails = category || arbitrator

  return (
    <>
      <ViewCard>
        {marketHasDetails && details()}
        {userHasShares && <SubsectionTitle>Balance</SubsectionTitle>}
        <Table head={renderTableHeader()}>{renderTableData()}</Table>
        <ButtonContainerStyled>
          <ButtonAnchor href={`/#/${marketMakerAddress}/fund`}>Fund</ButtonAnchor>
          {userHasShares && (
            <ButtonAnchor
              backgroundColor={theme.colors.secondary}
              href={`/#/${marketMakerAddress}/sell`}
            >
              Sell
            </ButtonAnchor>
          )}
          <ButtonAnchor href={`/#/${marketMakerAddress}/buy`}>Buy</ButtonAnchor>
          {isQuestionFinalized && <Button onClick={onResolveCondition}>Resolve condition</Button>}
        </ButtonContainerStyled>
        <ThreeBoxComments threadName={marketMakerAddress} />
      </ViewCard>
      {status === Status.Loading ? <FullLoading /> : null}
    </>
  )
}

export const View = withRouter(withTheme(ViewWrapper))
