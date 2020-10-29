import { BigNumber } from 'ethers/utils'
import React, { useState } from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'

import { WhenConnected } from '../../../../../hooks/connectedWeb3'
import { useRealityLink } from '../../../../../hooks/useRealityLink'
import { BalanceItem, MarketMakerData } from '../../../../../util/types'
import { Button } from '../../../../button'
import { ButtonType } from '../../../../button/button_styling_types'
import { MarketScale } from '../../../common/market_scale'
import { MarketTopDetailsOpen } from '../../../common/market_top_details_open'
import { MarketBuyContainer } from '../../market_buy/market_buy_container'
import { MarketNavigation } from '../../market_navigation'
import { MarketPoolLiquidityContainer } from '../../market_pooling/market_pool_liquidity_container'
import { MarketSellContainer } from '../../market_sell/market_sell_container'

import { BottomCard, StyledButtonContainer, TopCard } from './open'

interface Props extends RouteComponentProps<Record<string, string | undefined>> {
  account: Maybe<string>
  marketMakerData: MarketMakerData
}

const Wrapper = (props: Props) => {
  const { marketMakerData } = props
  const realitioBaseUrl = useRealityLink()

  const { address: marketMakerAddress, balances, isQuestionFinalized, question, totalPoolShares } = marketMakerData

  // TODO: Remove hardcoded values
  const lowerBound = new BigNumber('0')
  const currentPrediction = new BigNumber('720')
  const upperBound = new BigNumber('1000')
  const unit = 'USD'

  const isQuestionOpen = question.resolution.valueOf() < Date.now()

  const userHasShares = balances.some((balanceItem: BalanceItem) => {
    const { shares } = balanceItem
    return !shares.isZero()
  })

  const hasFunding = totalPoolShares.gt(0)

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
          setCurrentTab('SELL')
        }}
      >
        Sell
      </Button>
      <Button
        buttonType={ButtonType.secondaryLine}
        disabled={!hasFunding}
        onClick={() => {
          setCurrentTab('BUY')
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
    buy: 'BUY',
    sell: 'SELL',
  }

  const switchMarketTab = (newTab: string) => {
    setCurrentTab(newTab)
  }

  return (
    <>
      <TopCard>
        <MarketTopDetailsOpen marketMakerData={marketMakerData} />
      </TopCard>
      <BottomCard>
        <MarketNavigation
          activeTab={currentTab}
          isQuestionFinalized={isQuestionFinalized}
          marketAddress={marketMakerAddress}
          resolutionDate={question.resolution}
          switchMarketTab={switchMarketTab}
        ></MarketNavigation>
        {currentTab === marketTabs.swap && (
          <>
            <MarketScale
              // TODO: Change to collateral.decimals
              decimals={0}
              lowerBound={lowerBound}
              startingPoint={currentPrediction}
              startingPointTitle={'Current prediction'}
              unit={unit}
              upperBound={upperBound}
            />
            <WhenConnected>
              <StyledButtonContainer className={!hasFunding ? 'border' : ''}>
                {isQuestionOpen ? openInRealitioButton : buySellButtons}
              </StyledButtonContainer>
            </WhenConnected>
          </>
        )}
        {currentTab === marketTabs.pool && (
          <MarketPoolLiquidityContainer
            isScalar={true}
            marketMakerData={marketMakerData}
            switchMarketTab={switchMarketTab}
          />
        )}
        {/* {currentTab === marketTabs.history && <MarketHistoryContainer marketMakerData={marketMakerData} />} */}
        {currentTab === marketTabs.buy && (
          <MarketBuyContainer isScalar={true} marketMakerData={marketMakerData} switchMarketTab={switchMarketTab} />
        )}
        {currentTab === marketTabs.sell && (
          <MarketSellContainer isScalar={true} marketMakerData={marketMakerData} switchMarketTab={switchMarketTab} />
        )}
        {/* {currentTab === marketTabs.verify && <p>verify</p>} */}
      </BottomCard>
    </>
  )
}

export const OpenScalarMarketDetails = withRouter(Wrapper)
