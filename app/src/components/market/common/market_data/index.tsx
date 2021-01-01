import { BigNumber, bigNumberify, parseUnits } from 'ethers/utils'
import moment from 'moment'
import momentTZ from 'moment-timezone'
import React, { DOMAttributes, useEffect, useState } from 'react'
import styled from 'styled-components'

import { useConnectedWeb3Context, useTokens } from '../../../../hooks'
import { CompoundService } from '../../../../services/compound_service'
import { getToken } from '../../../../util/networks'
import { formatBigNumber, formatDate, formatToShortNumber } from '../../../../util/tools'
import { CompoundTokenType, Token } from '../../../../util/types'
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
    margin-bottom: 20px;
    & > * + * {
      margin-top: 13px;
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

const MarketDataItemImage = styled.img`
  max-height: 18px;
  max-width: 18px;
  margin-right: 10px;
`

interface Props extends DOMAttributes<HTMLDivElement> {
  collateralVolume: BigNumber
  liquidity: string
  resolutionTimestamp: Date
  runningDailyVolumeByHour: BigNumber[]
  lastActiveDay: number
  currency: Token
  isFinalize?: boolean
  answerFinalizedTimestamp?: Maybe<BigNumber>
}

export const MarketData: React.FC<Props> = props => {
  const {
    answerFinalizedTimestamp,
    collateralVolume,
    currency,
    isFinalize = false,
    lastActiveDay,
    liquidity,
    resolutionTimestamp,
    runningDailyVolumeByHour,
  } = props
  const [displayCurrency, setDisplayCurrency] = useState<Token>(currency)
  const context = useConnectedWeb3Context()
  const tokens = useTokens(context)
  const [currencyIcon, setCurrencyIcon] = useState<string | undefined>('')
  const [showUTC, setShowUTC] = useState<boolean>(true)
  const [show24H, setShow24H] = useState<boolean>(false)
  const [totalVolume, setTotalVolume] = useState<string>('')
  const [dailyVolume, setDailyVolume] = useState<string>('')
  const [displayLiquidity, setDisplayLiquidity] = useState<string>('')
  const { account, library: provider } = context

  const setDisplayCurrencyValues = async () => {
    if (displayCurrency.symbol.toLowerCase() in CompoundTokenType) {
      const compoundService = new CompoundService(currency.address, currency.symbol, provider, account)
      const totalVolumeRaw: BigNumber = await compoundService.calculateCTokenToBaseExchange(
        displayCurrency,
        collateralVolume,
      )
      const totalVolume = formatBigNumber(totalVolumeRaw, displayCurrency.decimals)
      setTotalVolume(totalVolume)
      const dailyVolume =
        Math.floor(Date.now() / 86400000) === lastActiveDay && runningDailyVolumeByHour && currency.decimals
          ? runningDailyVolumeByHour[Math.floor(Date.now() / (1000 * 60 * 60)) % 24]
          : bigNumberify('0')
      const dailyVolumeRaw: BigNumber = await compoundService.calculateCTokenToBaseExchange(
        displayCurrency,
        dailyVolume,
      )
      const dailyVolumeDisplay = formatBigNumber(dailyVolumeRaw, displayCurrency.decimals)
      setDailyVolume(dailyVolumeDisplay)
      const liquidityRaw = parseUnits(liquidity, currency.decimals)
      const baseTokenLiquidityRaw = await compoundService.calculateCTokenToBaseExchange(displayCurrency, liquidityRaw)
      const displayLiquidity = formatBigNumber(baseTokenLiquidityRaw, displayCurrency.decimals)
      setDisplayLiquidity(displayLiquidity)
    } else {
      const dailyVolume =
        Math.floor(Date.now() / 86400000) === lastActiveDay && runningDailyVolumeByHour && currency.decimals
          ? formatBigNumber(runningDailyVolumeByHour[Math.floor(Date.now() / (1000 * 60 * 60)) % 24], currency.decimals)
          : '0'
      setDailyVolume(dailyVolume)
      const totalVolume = formatBigNumber(collateralVolume, currency.decimals)
      setTotalVolume(totalVolume)
      setDisplayLiquidity(liquidity)
    }
  }

  useEffect(() => {
    const currencySymbol = currency.symbol.toLowerCase()
    let baseToken: Token = getToken(context.networkId, currencySymbol as KnownToken)
    if (currencySymbol in CompoundTokenType) {
      const baseTokenSymbol = currencySymbol.substring(1, currencySymbol.length) as KnownToken
      baseToken = getToken(context.networkId, baseTokenSymbol)
    }
    setDisplayCurrency(baseToken)
  }, [currency.symbol])

  useEffect(() => {
    setDisplayCurrencyValues()
  }, [displayCurrency.symbol])

  useEffect(() => {
    const matchingAddress = (token: Token) => token.address.toLowerCase() === currency.address.toLowerCase()
    const tokenIndex = tokens.findIndex(matchingAddress)
    tokenIndex !== -1 && setCurrencyIcon(tokens[tokenIndex].image)
  }, [tokens, currency.address, displayCurrency])

  const timezoneAbbr = momentTZ.tz(momentTZ.tz.guess()).zoneAbbr()

  return (
    <MarketDataWrapper>
      <MarketDataItem>
        <MarketDataItemTop>
          {formatToShortNumber(displayLiquidity)} {displayCurrency.symbol}
        </MarketDataItemTop>
        <MarketDataItemBottom>Liquidity</MarketDataItemBottom>
      </MarketDataItem>
      <MarketDataItem>
        <MarketDataItemTop>
          <MarketDataItemImage src={currencyIcon && currencyIcon}></MarketDataItemImage>
          {show24H ? formatToShortNumber(dailyVolume) : formatToShortNumber(totalVolume)} {displayCurrency.symbol}
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
      {isFinalize && answerFinalizedTimestamp && (
        <MarketDataItem>
          <MarketDataItemTop>
            {moment().from(moment(answerFinalizedTimestamp.toNumber() * 1000), false)}
          </MarketDataItemTop>
          <MarketDataItemBottom>Finalized</MarketDataItemBottom>
        </MarketDataItem>
      )}
      {!isFinalize && resolutionTimestamp > new Date() && (
        <MarketDataItem>
          <MarketDataItemTop>{moment(resolutionTimestamp).fromNow(true)}</MarketDataItemTop>
          <MarketDataItemBottom>Remaining</MarketDataItemBottom>
        </MarketDataItem>
      )}
    </MarketDataWrapper>
  )
}
