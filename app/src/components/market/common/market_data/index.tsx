import { BigNumber } from 'ethers/utils'
import moment from 'moment'
import momentTZ from 'moment-timezone'
import React, { DOMAttributes, useState } from 'react'
import styled from 'styled-components'

import { formatBigNumber, formatDate, formatNumber } from '../../../../util/tools'
import { Token } from '../../../../util/types'
import { TextToggle } from '../TextToggle'

const MarketDataWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 24px;

  & > * + * {
    margin-left: 38px;
  }

  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    flex-direction: column;
    margin-bottom: 0;
    & > * + * {
      margin-top: 12px;
      margin-left: 0;
    }
  }
`

const MarketDataItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  height: 39px;

  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    width: 100%;
    flex-direction: row-reverse;
    height: 16px;
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
interface Props extends DOMAttributes<HTMLDivElement> {
  collateralVolume: BigNumber
  liquidity: string
  resolutionTimestamp: Date
  runningDailyVolumeByHour: BigNumber[]
  lastActiveDay: number
  currency: Token
}

export const MarketData: React.FC<Props> = props => {
  const { collateralVolume, currency, lastActiveDay, liquidity, resolutionTimestamp, runningDailyVolumeByHour } = props

  const [showUTC, setShowUTC] = useState<boolean>(true)
  const [show24H, setShow24H] = useState<boolean>(false)

  const timezoneAbbr = momentTZ.tz(momentTZ.tz.guess()).zoneAbbr()

  const dailyVolume =
    Math.floor(Date.now() / 86400000) === lastActiveDay && runningDailyVolumeByHour && currency.decimals
      ? formatBigNumber(runningDailyVolumeByHour[Math.floor(Date.now() / (1000 * 60 * 60)) % 24], currency.decimals)
      : '0'

  const totalVolume = formatBigNumber(collateralVolume, currency.decimals)

  return (
    <MarketDataWrapper>
      <MarketDataItem>
        <MarketDataItemTop>
          {formatNumber(liquidity)} {currency.symbol}
        </MarketDataItemTop>
        <MarketDataItemBottom>Liquidity</MarketDataItemBottom>
      </MarketDataItem>
      <MarketDataItem>
        <MarketDataItemTop>
          {show24H ? formatNumber(dailyVolume) : formatNumber(totalVolume)} {currency.symbol}
        </MarketDataItemTop>
        <TextToggle
          alternativeLabel="24h Volume"
          isMain={!show24H}
          mainLabel="Total Volume"
          onClick={() => setShow24H(value => !value)}
        />
      </MarketDataItem>
      <MarketDataItem>
        <MarketDataItemTop>
          {showUTC
            ? formatDate(resolutionTimestamp, false)
            : moment(resolutionTimestamp).format('YYYY-MM-DD - H:mm zz')}{' '}
        </MarketDataItemTop>
        <TextToggle
          alternativeLabel={`Closing Date - ${timezoneAbbr}`}
          isMain={showUTC}
          mainLabel="Closing Date - UTC"
          onClick={() => setShowUTC(value => !value)}
        />
      </MarketDataItem>
      <MarketDataItem>
        <MarketDataItemTop>
          {resolutionTimestamp > new Date() ? moment(resolutionTimestamp).fromNow(true) : '0 days'}
        </MarketDataItemTop>
        <MarketDataItemBottom>Remaining</MarketDataItemBottom>
      </MarketDataItem>
    </MarketDataWrapper>
  )
}
