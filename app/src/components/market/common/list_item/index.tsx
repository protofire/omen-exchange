import moment from 'moment'
import React, { HTMLAttributes, useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

import { useConnectedWeb3Context } from '../../../../hooks/connectedWeb3'
import { ERC20Service } from '../../../../services'
import { getLogger } from '../../../../util/logger'
import { getTokenFromAddress } from '../../../../util/networks'
import { calcPrice, formatBigNumber, formatNumber } from '../../../../util/tools'
import { MarketMakerDataItem } from '../../../../util/types'
import { IconStar } from '../../../common/icons/IconStar'

const Wrapper = styled(NavLink)`
  border-bottom: 1px solid ${props => props.theme.borders.borderColor};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 22px 25px;
  text-decoration: none;

  &:active,
  &:hover {
    background-color: ${props => props.theme.colors.activeListItemBackground};
  }

  &:last-child {
    border-bottom: none;
  }
`

const Title = styled.h2`
  color: ${props => props.theme.colors.textColorDarker};
  font-size: 15px;
  font-weight: 500;
  line-height: 1.2;
  margin: 0 0 10px 0;
`

const Info = styled.div`
  font-family: 'Roboto';
  align-items: center;
  color: ${props => props.theme.colors.textColorLighter};
  display: flex;
  flex-wrap: wrap;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.2;
  overflow-wrap: break-word;
  white-space: normal;
  word-break: break-all;
`

const Outcome = styled.span`
  color: ${props => props.theme.colors.primaryLight};
  margin-left: 8px;
  font-weight: 500;
`

const Separator = styled.span`
  font-size: 18px;
  margin: 0 8px;
  color: ${props => props.theme.colors.verticalDivider};
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  market: MarketMakerDataItem
  currentFilter: any
}

const logger = getLogger('Market::ListItem')

export const ListItem: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { account, library: provider } = context

  const { currentFilter, market } = props
  const {
    address,
    collateralToken,
    collateralVolume,
    creationTimestamp,
    lastActiveDay,
    openingTimestamp,
    outcomeTokenAmounts,
    outcomes,
    runningDailyVolumeByHour,
    scaledLiquidityParameter,
    title,
  } = market

  let token
  let tokenVolume
  try {
    token = getTokenFromAddress(context.networkId, collateralToken)
    tokenVolume = formatBigNumber(collateralVolume, token.decimals)
  } catch (err) {
    logger.error(err.message)
  }

  const [volume, setVolume] = useState(tokenVolume || '')
  const [symbol, setSymbol] = useState(token ? token.symbol : '')
  const [decimals, setDecimals] = useState(token ? token.decimals : undefined)

  const now = moment()
  const endDate = openingTimestamp
  const endsText = moment(endDate).fromNow(true)
  const resolutionDate = moment(endDate).format('MMM Do, YYYY')

  const creationDate = new Date(1000 * parseInt(creationTimestamp))
  const formattedCreationDate = moment(creationDate).format('MMM Do, YYYY')

  const formattedLiquidity: string = scaledLiquidityParameter.toFixed(2)

  useEffect(() => {
    const setToken = async () => {
      if (!symbol) {
        // fallback to token service if unknown token
        const erc20Service = new ERC20Service(provider, account, collateralToken)
        const { decimals, symbol } = await erc20Service.getProfileSummary()
        const volume = formatBigNumber(collateralVolume, decimals)

        setDecimals(decimals)
        setVolume(volume)
        setSymbol(symbol)
      }
    }

    setToken()
  }, [account, collateralToken, collateralVolume, provider, context.networkId, symbol])

  const percentages = calcPrice(outcomeTokenAmounts)
  const indexMax = percentages.indexOf(Math.max(...percentages))

  return (
    <Wrapper to={`/${address}`}>
      <Title>{title}</Title>
      <Info>
        <IconStar></IconStar>
        <Outcome>{outcomes && `${outcomes[indexMax]} (${(percentages[indexMax] * 100).toFixed(2)}%)`}</Outcome>
        <Separator>|</Separator>
        <span>{moment(endDate).isAfter(now) ? `${endsText} remaining` : `Closed ${endsText} ago`}</span>
        <Separator>|</Separator>
        <span>
          {currentFilter.sortBy === 'usdVolume' && `${formatNumber(volume)} ${symbol} - Volume`}
          {currentFilter.sortBy === 'openingTimestamp' &&
            `${resolutionDate} - ${moment(endDate).isAfter(now) ? 'Closing' : 'Closed'}`}
          {currentFilter.sortBy === `sort24HourVolume${Math.floor(Date.now() / (1000 * 60 * 60)) % 24}` &&
            `${
              Math.floor(Date.now() / 86400000) === lastActiveDay && runningDailyVolumeByHour && decimals
                ? formatBigNumber(runningDailyVolumeByHour[Math.floor(Date.now() / (1000 * 60 * 60)) % 24], decimals)
                : 0
            } ${symbol} - 24hr Volume`}
          {currentFilter.sortBy === 'usdLiquidityParameter' && `${formattedLiquidity} ${symbol} - Liquidity`}
          {currentFilter.sortBy === 'creationTimestamp' && `${formattedCreationDate} - Created`}
        </span>
      </Info>
    </Wrapper>
  )
}
