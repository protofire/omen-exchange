import { BigNumber } from 'ethers'
import moment from 'moment'
import momentTZ from 'moment-timezone'
import React, { DOMAttributes, useEffect, useState } from 'react'
import styled from 'styled-components'

import { useConnectedWeb3Context, useTokens } from '../../../../hooks'
import { formatBigNumber } from '../../../../util/tools'
import { Token } from '../../../../util/types'

const MarketDataWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
  margin-bottom: 32px;

  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    flex-direction: column;
    margin-bottom: 0;
  }
`

const MarketDataItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  height: 39px;
  width: 33.33%;

  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    width: 100%;
    flex-direction: row-reverse;
    height: 16px;
    margin-bottom: 12px;

    &:nth-of-type(3) {
      margin-bottom: 0;
    }
  }
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
  runningDailyVolumeByHour: BigNumber[]
  lastActiveDay: number
  currency: Token
}

export const MarketData: React.FC<Props> = props => {
  const { currency, lastActiveDay, resolutionTimestamp, runningDailyVolumeByHour } = props

  const context = useConnectedWeb3Context()
  const tokens = useTokens(context)

  const [currencyIcon, setCurrencyIcon] = useState<string | undefined>('')

  useEffect(() => {
    const matchingAddress = (token: Token) => token.address.toLowerCase() === currency.address.toLowerCase()
    const tokenIndex = tokens.findIndex(matchingAddress)
    tokenIndex !== -1 && setCurrencyIcon(tokens[tokenIndex].image)
  }, [tokens, currency.address])

  const timezoneAbbr = momentTZ.tz(momentTZ.tz.guess()).zoneAbbr()

  const dailyVolume =
    Math.floor(Date.now() / 86400000) === lastActiveDay && runningDailyVolumeByHour && currency.decimals
      ? formatBigNumber(runningDailyVolumeByHour[Math.floor(Date.now() / (1000 * 60 * 60)) % 24], currency.decimals)
      : '0'

  return (
    <MarketDataWrapper>
      <MarketDataItem>
        <MarketDataItemTop>
          {moment(resolutionTimestamp).format('DD.MM.YYYY - H:mm zz')} {timezoneAbbr}
        </MarketDataItemTop>
        <MarketDataItemBottom>Closing Date</MarketDataItemBottom>
      </MarketDataItem>
      <MarketDataItem>
        <MarketDataItemTop>
          {resolutionTimestamp > new Date() ? moment(resolutionTimestamp).fromNow(true) : '0 days'}
        </MarketDataItemTop>
        <MarketDataItemBottom>Time remaining</MarketDataItemBottom>
      </MarketDataItem>
      <MarketDataItem>
        <MarketDataItemTop>
          <MarketDataItemImage src={currencyIcon && currencyIcon}></MarketDataItemImage>
          {dailyVolume} {currency.symbol}
        </MarketDataItemTop>
        <MarketDataItemBottom>24h Trade Volume</MarketDataItemBottom>
      </MarketDataItem>
    </MarketDataWrapper>
  )
}
