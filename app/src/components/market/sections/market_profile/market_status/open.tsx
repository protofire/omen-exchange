import React, { useState } from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { WhenConnected } from '../../../../../hooks/connectedWeb3'
import { BalanceItem, MarketMakerData, OutcomeTableValue } from '../../../../../util/types'
import { Button, ButtonContainer } from '../../../../button'
import { ButtonType } from '../../../../button/button_styling_types'
import { MarketTopDetailsOpen } from '../../../common/market_top_details_open'
import { OutcomeTable } from '../../../common/outcome_table'
import { ViewCard } from '../../../common/view_card'
import { WarningMessage } from '../../../common/warning_message'
import { MarketNavigation } from '../../market_navigation'

const TopCard = styled(ViewCard)`
  padding-bottom: 0;
  margin-bottom: 24px;
`

const BottomCard = styled(ViewCard)``

const MessageWrapper = styled.div`
  border-radius: 4px;
  border: 1px solid ${props => props.theme.borders.borderColorLighter};
  margin-top: 20px;
  margin-bottom: 20px;
  padding: 20px 25px;
`

const Title = styled.h2`
  color: ${props => props.theme.colors.textColorDarker};
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.2px;
  line-height: 1.2;
  margin: 0 0 8px;
`

const Text = styled.p`
  color: ${props => props.theme.colors.textColor};
  font-size: 14px;
  font-weight: normal;
  letter-spacing: 0.2px;
  line-height: 1.5;
  margin: 0;
`

const StyledButtonContainer = styled(ButtonContainer)`
  margin: 0 -25px;
  padding: 20px 25px 0;

  &.border {
    border-top: 1px solid ${props => props.theme.colors.verticalDivider};
  }
`

const WarningMessageStyled = styled(WarningMessage)`
  margin-top: 20px;
`

interface Props extends RouteComponentProps<Record<string, string | undefined>> {
  account: Maybe<string>
  marketMakerData: MarketMakerData
}

const Wrapper = (props: Props) => {
  const { history, marketMakerData } = props

  const {
    address: marketMakerAddress,
    balances,
    collateral,
    isQuestionFinalized,
    question,
    totalPoolShares,
  } = marketMakerData

  const isQuestionOpen = question.resolution.valueOf() < Date.now()

  const userHasShares = balances.some((balanceItem: BalanceItem) => {
    const { shares } = balanceItem
    return !shares.isZero()
  })

  const probabilities = balances.map(balance => balance.probability)
  const hasFunding = totalPoolShares.gt(0)

  const windowObj: any = window
  const realitioBaseUrl =
    windowObj.ethereum && windowObj.ethereum.isMetaMask ? 'https://reality.eth' : 'https://reality.eth.link'

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

  const openQuestionMessage = (
    <MessageWrapper>
      <Title>The question is being resolved.</Title>
      <Text>You will be able to redeem your winnings as soon as the market is resolved.</Text>
    </MessageWrapper>
  )

  const openInRealitioButton = (
    <Button
      buttonType={ButtonType.secondaryLine}
      onClick={() => {
        window.open(`${realitioBaseUrl}/app/#!/question/${question.id}`)
      }}
    >
      Answer on Reality.eth
    </Button>
  )

  const buySellButtons = (
    <>
      <Button
        buttonType={ButtonType.secondaryLine}
        disabled={!userHasShares || !hasFunding}
        onClick={() => {
          history.push(`${marketMakerAddress}/sell`)
        }}
      >
        Sell
      </Button>
      <Button
        buttonType={ButtonType.secondaryLine}
        disabled={!hasFunding}
        onClick={() => {
          history.push(`${marketMakerAddress}/buy`)
        }}
      >
        Buy
      </Button>
    </>
  )

  const [currentTab, setCurrentTab] = useState('SWAP')

  const marketTabs = {
    swap: 'SWAP',
    pool: 'POOL',
    history: 'HISTORY',
    verify: 'VERIFY',
  }

  const switchMarketTab = (newTab: string) => {
    if (newTab in marketTabs) {
      setCurrentTab(newTab)
    }
  }

  return (
    <>
      <TopCard>
        <MarketTopDetailsOpen marketMakerData={marketMakerData} />
      </TopCard>
      <BottomCard>
        <MarketNavigation
          activeTab={'SWAP'}
          isQuestionFinalized={isQuestionFinalized}
          marketAddress={marketMakerAddress}
          resolutionDate={question.resolution}
          switchMarketTab={switchMarketTab}
        ></MarketNavigation>
        {currentTab === marketTabs.swap && (
          <>
            {renderTableData()}
            {isQuestionOpen && openQuestionMessage}
            {!hasFunding && !isQuestionOpen && (
              <WarningMessageStyled
                additionalDescription={''}
                description={'Trading is disabled due to lack of liquidity.'}
                grayscale={true}
                href={''}
                hyperlinkDescription={''}
              />
            )}
            <WhenConnected>
              <StyledButtonContainer className={!hasFunding ? 'border' : ''}>
                {isQuestionOpen ? openInRealitioButton : buySellButtons}
              </StyledButtonContainer>
            </WhenConnected>
          </>
        )}
        {currentTab === marketTabs.pool && <p>pool</p>}
        {currentTab === marketTabs.pool && <p>history</p>}
        {currentTab === marketTabs.pool && <p>verify</p>}
      </BottomCard>
    </>
  )
}

export const OpenMarketDetails = withRouter(Wrapper)
