import React, { DOMAttributes, useEffect, useState } from 'react'
import styled from 'styled-components'
import moment from 'moment'
import momentTZ from 'moment-timezone'
import { BigNumber } from 'ethers/utils'

import { Token } from '../../../../util/types'
import { formatBigNumber, formatNumber } from '../../../../util/tools'
import { useConnectedWeb3Context, useTokens } from '../../../../hooks'

const MarketDataWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
  margin-bottom: 32px;
`

const MarketDataItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  height: 39px;
  width: 33.33%;
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

const MarketDataItemImage = styled.img`
  max-height: 18px;
  max-width: 18px;
  margin-right: 10px;
`

interface Props extends DOMAttributes<HTMLDivElement> {
  resolutionTimestamp: Date
  dailyVolume: BigNumber
  currency: Token
}

export const MarketData: React.FC<Props> = props => {
  const { resolutionTimestamp, dailyVolume, currency } = props

  const context = useConnectedWeb3Context()
  const tokens = useTokens(context)

  const [currencyIcon, setCurrencyIcon] = useState<string | undefined>('')

  useEffect(() => {
    if(tokens.length > 1) {
      const matchingAddress = (token: Token) => token.address === currency.address
      const tokenIndex = tokens.findIndex(matchingAddress)
      setCurrencyIcon(tokens[tokenIndex].image)
    } 
    return
  }, [tokens])

  const timezoneAbbr = momentTZ.tz(momentTZ.tz.guess()).zoneAbbr()

  return (
    <MarketDataWrapper>
      <MarketDataItem>
        <MarketDataItemTop>
          {moment(resolutionTimestamp).format("DD.MM.YYYY - H:mm zz")} {timezoneAbbr}
        </MarketDataItemTop>
        <MarketDataItemBottom>
          Closing Date
        </MarketDataItemBottom>
      </MarketDataItem>
      <MarketDataItem>
        <MarketDataItemTop>
          {resolutionTimestamp > new Date() ? moment(resolutionTimestamp).fromNow(true) : '0 days'}
        </MarketDataItemTop>
        <MarketDataItemBottom>
          Time remaining
        </MarketDataItemBottom>
      </MarketDataItem>
      <MarketDataItem>
        <MarketDataItemTop>
          <MarketDataItemImage src={currencyIcon && currencyIcon}></MarketDataItemImage>
          {formatNumber(formatBigNumber(dailyVolume, currency.decimals))} {currency.symbol}
        </MarketDataItemTop>
        <MarketDataItemBottom>
          24h Trade Volume
        </MarketDataItemBottom>
      </MarketDataItem>
    </MarketDataWrapper>
  )
}