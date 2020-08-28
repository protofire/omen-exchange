import React, { DOMAttributes } from 'react'
import styled from 'styled-components'
import { BigNumber } from 'ethers/utils'

import { Token } from '../../../../util/types'
import { formatBigNumber } from '../../../../util/tools'

const MarketDataWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
`

const MarketDataItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  height: 39px;
`

const MarketDataItemTop = styled.div`
  color: ${props => props.theme.colors.textColorDarker}
  font-size: 14px;
  font-weight: 500;
  line-height: 16px;
`

const MarketDataItemBottom = styled.div`
  color: ${props => props.theme.colors.textColor}
  font-size: 14px;
  font-weight: 400;
  line-height: 16px;
`

interface Props extends DOMAttributes<HTMLDivElement> {
  resolutionTimestamp: Date
  dailyVolume: BigNumber
  currency: Token
}

export const MarketData: React.FC<Props> = props => {
  return (
    <MarketDataWrapper>
      <MarketDataItem>
        <MarketDataItemTop>

        </MarketDataItemTop>
        <MarketDataItemBottom>

        </MarketDataItemBottom>
      </MarketDataItem>
      <MarketDataItem>
        <MarketDataItemTop>

        </MarketDataItemTop>
        <MarketDataItemBottom>
          
        </MarketDataItemBottom>
      </MarketDataItem>
      <MarketDataItem>
        <MarketDataItemTop>

        </MarketDataItemTop>
        <MarketDataItemBottom>
          
        </MarketDataItemBottom>
      </MarketDataItem>
    </MarketDataWrapper>
  )
}