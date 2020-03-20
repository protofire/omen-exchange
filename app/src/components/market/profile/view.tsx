import { BigNumber } from 'ethers/utils'
import React, { useState } from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { WhenConnected } from '../../../hooks/connectedWeb3'
import { formatBigNumber } from '../../../util/tools'
import { Arbitrator, BalanceItem, OutcomeTableValue, Status, Token } from '../../../util/types'
import { Button, ButtonContainer } from '../../button'
import { ButtonType } from '../../button/button_styling_types'
import { ThreeBoxComments, ViewCard } from '../../common'
import { OutcomeTable } from '../../common/outcome_table'
import { FullLoading } from '../../loading'
import { MarketTopDetails } from '../market_top_details'

const LeftButton = styled(Button)`
  margin-right: auto;
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
  totalPoolShares: BigNumber
  userPoolShares: BigNumber
}

const ViewWrapper = (props: Props) => {
  const { balances, collateral, history, marketMakerAddress, status } = props

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

  return (
    <>
      <ViewCard>
        <MarketTopDetails
          title="Purchase Outcome"
          toggleTitleAction="Pool Information"
          marketMakerAddress={marketMakerAddress}
        />
        {renderTableData()}
        <WhenConnected>
          <ButtonContainer>
            <LeftButton
              buttonType={ButtonType.secondaryLine}
              onClick={() => {
                history.push(`${marketMakerAddress}/pool-liquidity`)
              }}
            >
              Pool Liquidity
            </LeftButton>
            <Button
              buttonType={ButtonType.secondaryLine}
              disabled={!userHasShares}
              onClick={() => {
                history.push(`${marketMakerAddress}/sell`)
              }}
            >
              Sell
            </Button>
            <Button
              buttonType={ButtonType.secondaryLine}
              onClick={() => {
                history.push(`${marketMakerAddress}/buy`)
              }}
            >
              Buy
            </Button>
          </ButtonContainer>
        </WhenConnected>
      </ViewCard>
      <ThreeBoxComments threadName={marketMakerAddress} />
      {status === Status.Loading && <FullLoading />}
    </>
  )
}

export const View = withRouter(ViewWrapper)
