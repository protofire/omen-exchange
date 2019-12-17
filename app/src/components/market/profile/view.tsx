import React from 'react'
import styled, { withTheme } from 'styled-components'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { ThreeBoxComments } from '../../common/three_box_comments'
import { ViewCard } from '../../common/view_card'
import { Status, BalanceItem, Token, Arbitrator, OutcomeTableValue } from '../../../util/types'
import { ButtonAnchor, OutcomeTable } from '../../common'
import { FullLoading } from '../../common/full_loading'
import { ButtonContainer } from '../../common/button_container'
import { SubsectionTitle } from '../../common/subsection_title'
import { BigNumber } from 'ethers/utils'
import { TitleValue } from '../../common/title_value'
import { DisplayArbitrator } from '../../common/display_arbitrator'

interface Props extends RouteComponentProps<{}> {
  arbitrator: Maybe<Arbitrator>
  balance: BalanceItem[]
  category: string
  collateral: Token
  funding: BigNumber
  marketMakerAddress: string
  question: string
  questionId: string
  status: Status
  theme?: any
}

const Grid = styled.div`
  display: grid;
  grid-column-gap: 20px;
  grid-row-gap: 14px;
  grid-template-columns: 1fr 1fr;
  margin-bottom: 25px;
`

const ViewWrapper = (props: Props) => {
  const {
    arbitrator,
    balance,
    category,
    collateral,
    marketMakerAddress,
    questionId,
    status,
  } = props

  const userHasShares = balance.some((balanceItem: BalanceItem) => {
    const { shares } = balanceItem
    return !shares.isZero()
  })

  const renderTableData = () => {
    const disabledColumns = [OutcomeTableValue.Payout, OutcomeTableValue.PriceAfterTrade]
    if (!userHasShares) {
      disabledColumns.push(OutcomeTableValue.Shares)
    }
    return (
      <OutcomeTable
        balance={balance}
        collateral={collateral}
        displayRadioSelection={false}
        disabledColumns={disabledColumns}
      />
    )
  }

  const details = () => {
    return (
      <>
        <SubsectionTitle>Details</SubsectionTitle>
        <Grid>
          {category && <TitleValue title={'Category'} value={category} />}
          <TitleValue
            title={'Arbitrator'}
            value={arbitrator && <DisplayArbitrator arbitrator={arbitrator} />}
          />
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
        {renderTableData()}
        <ButtonContainer>
          <ButtonAnchor href={`/#/${marketMakerAddress}/fund`}>Fund</ButtonAnchor>
          {userHasShares && (
            <ButtonAnchor href={`/#/${marketMakerAddress}/sell`}>Sell</ButtonAnchor>
          )}
          <ButtonAnchor href={`/#/${marketMakerAddress}/buy`}>Buy</ButtonAnchor>
        </ButtonContainer>
        <ThreeBoxComments threadName={marketMakerAddress} />
      </ViewCard>
      {status === Status.Loading ? <FullLoading /> : null}
    </>
  )
}

export const View = withRouter(withTheme(ViewWrapper))
