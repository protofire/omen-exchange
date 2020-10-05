import React, { useState } from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { WhenConnected } from '../../../../../hooks/connectedWeb3'
import { BalanceItem, MarketMakerData, OutcomeTableValue } from '../../../../../util/types'
import { Button, ButtonContainer } from '../../../../button'
import { ButtonType } from '../../../../button/button_styling_types'
import { SubsectionTitle, SubsectionTitleWrapper } from '../../../../common'
import { MarketTopDetailsOpen } from '../../../common/market_top_details_open'
import { OutcomeTable } from '../../../common/outcome_table'
import { ViewCard } from '../../../common/view_card'
import { WarningMessage } from '../../../common/warning_message'

const TopCard = styled(ViewCard)`
  padding-bottom: 0;
  margin-bottom: 24px;
`

const BottomCard = styled(ViewCard)``

const LeftButton = styled(Button)`
  margin-right: auto;
`

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

const MarketTabs = styled.div`
  display: flex;
  margin-top: -5px;
  margin-bottom: 20px;
`

const MarketTab = styled.div<{ active: boolean }>`
  font-size: 14px;
  color: ${props => (props.active ? props.theme.buttonSecondary.color : props.theme.colors.clickable)};
  background: none;
  border: none;
  border-radius: 32px;
  padding: 10px 18px;
  margin-right: 2px;
  background: ${props => (props.active ? props.theme.buttonSecondary.backgroundColor : `none`)};
  font-weight: ${props => (props.active ? `500` : `400`)};
  cursor: pointer;
`

interface Props extends RouteComponentProps<Record<string, string | undefined>> {
  account: Maybe<string>
  marketMakerData: MarketMakerData
}

const Wrapper = (props: Props) => {
  const { history, marketMakerData } = props

  const { address: marketMakerAddress, balances, collateral, question, totalPoolShares } = marketMakerData

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

  const [activeTab, setActiveTab] = useState('SWAP')

  const marketTabs = {
    history: 'HISTORY',
    pool: 'POOL',
    swap: 'SWAP',
    verify: 'VERIFY',
  }

  const handleMarketTabClick = (tab: string) => {
    setActiveTab(tab)
  }

  return (
    <>
      <TopCard>
        <MarketTopDetailsOpen marketMakerData={marketMakerData} />
      </TopCard>
      <BottomCard>
        <MarketTabs>
          <MarketTab active={activeTab === marketTabs.swap} onClick={() => handleMarketTabClick('SWAP')}>
            Swap
          </MarketTab>
          <MarketTab active={activeTab === marketTabs.pool} onClick={() => handleMarketTabClick('POOL')}>
            Pool
          </MarketTab>
          {/* Verify is commented out until the underlying infrastructure is ready */}
          {/* <MarketTab active={activeTab === marketTabs.verify} onClick={() => handleMarketTabClick('VERIFY')}>
            Verify
          </MarketTab> */}
          <MarketTab active={activeTab === marketTabs.history} onClick={() => handleMarketTabClick('HISTORY')}>
            History
          </MarketTab>
        </MarketTabs>
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
            {poolButton}
            {isQuestionOpen ? openInRealitioButton : buySellButtons}
          </StyledButtonContainer>
        </WhenConnected>
      </BottomCard>
    </>
  )
}

export const OpenMarketDetails = withRouter(Wrapper)
