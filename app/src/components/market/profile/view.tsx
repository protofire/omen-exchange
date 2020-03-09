import { BigNumber } from 'ethers/utils'
import React from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { WhenConnected } from '../../../hooks/connectedWeb3'
import { ButtonType } from '../../../theme/component_styles/button_styling_types'
import { Arbitrator, BalanceItem, OutcomeTableValue, Status, Token } from '../../../util/types'
import {
  Button,
  ButtonContainer,
  DisplayArbitrator,
  GridThreeColumns,
  Loading,
  SubsectionTitle,
  ThreeBoxComments,
  TitleValue,
  ViewCard,
} from '../../common'
import { OutcomeTable } from '../../common/outcome_table'

const LeftButton = styled(Button)`
  margin-right: auto;
`

const SubsectionTitleStyled = styled(SubsectionTitle)`
  margin-bottom: 0;
`

interface Props extends RouteComponentProps<{}> {
  account: Maybe<string>
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
  const { arbitrator, balances, category, collateral, history, marketMakerAddress, questionId, status } = props

  const userHasShares = balances.some((balanceItem: BalanceItem) => {
    const { shares } = balanceItem
    return !shares.isZero()
  })

  const probabilities = balances.map(balance => balance.probability)

  const renderTableData = () => {
    const disabledColumns = [OutcomeTableValue.Payout]
    if (!userHasShares) {
      disabledColumns.push(OutcomeTableValue.Shares)
    }
    return (
      <OutcomeTable
        balances={balances}
        collateral={collateral}
        disabledColumns={disabledColumns}
        displayRadioSelection={false}
        probabilities={probabilities}
      />
    )
  }

  const details = () => {
    return (
      <>
        <SubsectionTitle>Details</SubsectionTitle>
        <GridThreeColumns>
          {category && <TitleValue title={'Category'} value={category} />}
          <TitleValue title={'Arbitrator'} value={arbitrator && <DisplayArbitrator arbitrator={arbitrator} />} />
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
        <WhenConnected>
          <ButtonContainer>
            <LeftButton
              buttonType={ButtonType.secondaryLine}
              onClick={() => {
                history.push(`/#/${marketMakerAddress}/fund`)
              }}
            >
              Pool Liquidity
            </LeftButton>

            <Button
              buttonType={ButtonType.secondaryLine}
              disabled={!userHasShares}
              onClick={() => {
                history.push(`/#/${marketMakerAddress}/sell`)
              }}
            >
              Sell
            </Button>

            <Button
              buttonType={ButtonType.secondaryLine}
              onClick={() => {
                history.push(`/#/${marketMakerAddress}/buy`)
              }}
            >
              Buy
            </Button>
          </ButtonContainer>
        </WhenConnected>
      </ViewCard>
      <ThreeBoxComments threadName={marketMakerAddress} />
      {status === Status.Loading ? <Loading full={true} /> : null}
    </>
  )
}

export const View = withRouter(ViewWrapper)
