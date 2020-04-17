import React from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { IS_CORONA_VERSION } from '../../../../../common/constants'
import { WhenConnected } from '../../../../../hooks/connectedWeb3'
import { BalanceItem, MarketMakerData, OutcomeTableValue } from '../../../../../util/types'
import { Button, ButtonContainer } from '../../../../button'
import { ButtonType } from '../../../../button/button_styling_types'
import { MarketTopDetails } from '../../../common/market_top_details'
import { OutcomeTable } from '../../../common/outcome_table'
import { ViewCard } from '../../../common/view_card'

const LeftButton = styled(Button)`
  margin-right: auto;
`

interface Props extends RouteComponentProps<{}> {
  account: Maybe<string>
  marketMakerData: MarketMakerData
}

const Wrapper = (props: Props) => {
  const { history, marketMakerData } = props

  const { address: marketMakerAddress, balances, collateral, question } = marketMakerData

  const isQuestionOpen = question.resolution.valueOf() < Date.now()

  const userHasShares = balances.some((balanceItem: BalanceItem) => {
    const { shares } = balanceItem
    return !shares.isZero()
  })

  const probabilities = balances.map(balance => balance.probability)

  const renderTableData = () => {
    const disabledColumns = [OutcomeTableValue.Payout, OutcomeTableValue.Outcome, OutcomeTableValue.Probability]
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

  const poolButton = (
    <LeftButton
      buttonType={ButtonType.secondaryLine}
      onClick={() => {
        history.push(`${marketMakerAddress}/pool-liquidity`)
      }}
    >
      Pool Liquidity
    </LeftButton>
  )

  const openInRealitioButton = (
    <Button
      buttonType={ButtonType.secondaryLine}
      onClick={() => {
        window.open(`https://realitio.github.io/#!/question/${question.id}`)
      }}
    >
      Answer in Realit.io
    </Button>
  )

  const buySellButtons = (
    <>
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
    </>
  )

  return (
    <>
      <ViewCard>
        <MarketTopDetails marketMakerData={marketMakerData} toggleTitle="Pool Information" />
        {renderTableData()}
        <WhenConnected>
          <ButtonContainer>
            {!IS_CORONA_VERSION && poolButton}
            {isQuestionOpen ? openInRealitioButton : buySellButtons}
          </ButtonContainer>
        </WhenConnected>
      </ViewCard>
    </>
  )
}

export const OpenMarketDetails = withRouter(Wrapper)
