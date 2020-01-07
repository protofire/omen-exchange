import React from 'react'
import styled from 'styled-components'
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
import { GridThreeColumns } from '../../common/grid_three_columns'

const SubsectionTitleStyled = styled(SubsectionTitle)`
  margin-bottom: 0;
`

interface Props extends RouteComponentProps<{}> {
  balances: BalanceItem[]
  collateral: Token
  arbitrator: Maybe<Arbitrator>
  question: string
  questionId: string
  category: string
  status: Status
  marketMakerAddress: string
  funding: BigNumber
}

const ViewWrapper = (props: Props) => {
  const {
    balances,
    collateral,
    status,
    questionId,
    marketMakerAddress,
    arbitrator,
    category,
  } = props

  const userHasShares = balances.some((balanceItem: BalanceItem) => {
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
        balances={balances}
        collateral={collateral}
        displayRadioSelection={false}
        disabledColumns={disabledColumns}
        displayWinningOutcomeColor={false}
      />
    )
  }

  const details = () => {
    return (
      <>
        <SubsectionTitle>Details</SubsectionTitle>
        <GridThreeColumns>
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
        </GridThreeColumns>
      </>
    )
  }

  const marketHasDetails = category || arbitrator

  return (
    <>
      <ViewCard>
        <SubsectionTitleStyled>Outcomes</SubsectionTitleStyled>
        {renderTableData()}
        {marketHasDetails && details()}
        <ButtonContainer>
          <ButtonAnchor href={`/#/${marketMakerAddress}/fund`}>Fund</ButtonAnchor>
          {userHasShares && (
            <ButtonAnchor href={`/#/${marketMakerAddress}/sell`}>Sell</ButtonAnchor>
          )}
          <ButtonAnchor href={`/#/${marketMakerAddress}/buy`}>Buy</ButtonAnchor>
        </ButtonContainer>
      </ViewCard>
      <ThreeBoxComments threadName={marketMakerAddress} />
      {status === Status.Loading ? <FullLoading /> : null}
    </>
  )
}

export const View = withRouter(ViewWrapper)
