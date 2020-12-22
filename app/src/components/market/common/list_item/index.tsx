import moment from 'moment'
import React, { HTMLAttributes, useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

import { REALITIO_SCALAR_ADAPTER_ADDRESS, REALITIO_SCALAR_ADAPTER_ADDRESS_RINKEBY } from '../../../../common/constants'
import { useConnectedWeb3Context } from '../../../../hooks/connectedWeb3'
import { ERC20Service } from '../../../../services'
import { getLogger } from '../../../../util/logger'
import { getTokenFromAddress } from '../../../../util/networks'
import { calcPrice, formatBigNumber, formatNumber, formatToShortNumber } from '../../../../util/tools'
import { MarketMakerDataItem, Token } from '../../../../util/types'
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
    oracle,
    outcomeTokenAmounts,
    outcomeTokenMarginalPrices,
    outcomes,
    runningDailyVolumeByHour,
    scalarHigh,
    scalarLow,
    scaledLiquidityParameter,
    title,
  } = market

  let token: Token | undefined
  try {
    const tokenInfo = getTokenFromAddress(context.networkId, collateralToken)
    const volume = formatBigNumber(collateralVolume, tokenInfo.decimals)
    token = { ...tokenInfo, volume }
  } catch (err) {
    logger.debug(err.message)
  }

  const [{ decimals, symbol, volume }, setDetails] = useState(token || { decimals: 0, symbol: '', volume: '' })

  const now = moment()
  const endDate = openingTimestamp
  const endsText = moment(endDate).fromNow(true)
  const resolutionDate = moment(endDate).format('MMM Do, YYYY')

  const creationDate = new Date(1000 * parseInt(creationTimestamp))
  const formattedCreationDate = moment(creationDate).format('MMM Do, YYYY')

  const formattedLiquidity: string = scaledLiquidityParameter.toFixed(2)

  useEffect(() => {
    const setToken = async () => {
      if (!token) {
        // fallback to token service if unknown token
        const erc20Service = new ERC20Service(provider, account, collateralToken)
        const { decimals, symbol } = await erc20Service.getProfileSummary()
        const volume = formatBigNumber(collateralVolume, decimals)

        setDetails({ symbol, decimals, volume })
      }
    }

    setToken()
  }, [account, collateralToken, collateralVolume, provider, context.networkId, token])

  const percentages = calcPrice(outcomeTokenAmounts)
  const indexMax = percentages.indexOf(Math.max(...percentages))

  let realitioScalarAdapter
  if (context.networkId === 1) {
    realitioScalarAdapter = REALITIO_SCALAR_ADAPTER_ADDRESS.toLowerCase()
  } else if (context.networkId === 4) {
    realitioScalarAdapter = REALITIO_SCALAR_ADAPTER_ADDRESS_RINKEBY.toLowerCase()
  }

  let isScalar = false
  if (oracle === realitioScalarAdapter) {
    isScalar = true
  }

  let currentPrediction
  let unit
  if (isScalar) {
    unit = title.split('[')[1].split(']')[0]
    const lowerBoundNumber = scalarLow && Number(formatBigNumber(scalarLow, 18))
    const upperBoundNumber = scalarHigh && Number(formatBigNumber(scalarHigh, 18))
    currentPrediction =
      Number(outcomeTokenMarginalPrices ? outcomeTokenMarginalPrices[1] : '0') *
      ((upperBoundNumber || 0) - (lowerBoundNumber || 0) + (lowerBoundNumber || 0))
  }

  return (
    <Wrapper to={`/${address}`}>
      <Title>{title}</Title>
      <Info>
        <IconStar></IconStar>
        <Outcome>
          {isScalar
            ? `${currentPrediction && formatNumber(currentPrediction.toString())} ${unit}`
            : outcomes && `${outcomes[indexMax]} (${(percentages[indexMax] * 100).toFixed(2)}%)`}
        </Outcome>
        <Separator>|</Separator>
        <span>{moment(endDate).isAfter(now) ? `${endsText} remaining` : `Closed ${endsText} ago`}</span>
        <Separator>|</Separator>
        <span>
          {currentFilter.sortBy === 'usdVolume' && `${formatToShortNumber(volume || '')} ${symbol} - Volume`}
          {currentFilter.sortBy === 'openingTimestamp' &&
            `${resolutionDate} - ${moment(endDate).isAfter(now) ? 'Closing' : 'Closed'}`}
          {currentFilter.sortBy === `sort24HourVolume${Math.floor(Date.now() / (1000 * 60 * 60)) % 24}` &&
            `${
              Math.floor(Date.now() / 86400000) === lastActiveDay && runningDailyVolumeByHour && decimals
                ? formatToShortNumber(
                    formatBigNumber(runningDailyVolumeByHour[Math.floor(Date.now() / (1000 * 60 * 60)) % 24], decimals),
                  )
                : 0
            } ${symbol} - 24hr Volume`}
          {currentFilter.sortBy === 'usdLiquidityParameter' &&
            `${formatToShortNumber(formattedLiquidity)} ${symbol} - Liquidity`}
          {currentFilter.sortBy === 'creationTimestamp' && `${formattedCreationDate} - Created`}
        </span>
      </Info>
    </Wrapper>
  )
}
