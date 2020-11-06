import { BigNumber } from 'ethers/utils'
import React from 'react'
import styled from 'styled-components'

import { MarketMakerData } from '../../../../util/types'
import { ButtonContainer } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import { MarketBottomNavButton } from '../../common/common_styled'
import { MarketScale } from '../../common/market_scale'

const StyledButtonContainer = styled(ButtonContainer)`
  justify-content: space-between;
`

interface Props {
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: string) => void
}

export const ScalarMarketBuy = (props: Props) => {
  const { marketMakerData, switchMarketTab } = props

  const { outcomeTokenMarginalPrices, question, scalarHigh, scalarLow } = marketMakerData

  return (
    <>
      <MarketScale
        currentPrediction={outcomeTokenMarginalPrices[1]}
        lowerBound={scalarLow || new BigNumber(0)}
        startingPointTitle={'Current prediction'}
        unit={question.title ? question.title.split('[')[1].split(']')[0] : ''}
        upperBound={scalarHigh || new BigNumber(0)}
      />
      <StyledButtonContainer>
        <MarketBottomNavButton buttonType={ButtonType.secondaryLine} onClick={() => switchMarketTab('SWAP')}>
          Cancel
        </MarketBottomNavButton>
        {/* TODO: Add isBuyDisabled and onClick handler */}
        <MarketBottomNavButton buttonType={ButtonType.secondaryLine}>Buy Position</MarketBottomNavButton>
      </StyledButtonContainer>
    </>
  )
}
