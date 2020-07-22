import { BigNumber } from 'ethers/utils'
import moment from 'moment'
import React, { HTMLAttributes, useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

import { useGraphMarketMakerData } from '../../../../hooks'
import { useConnectedWeb3Context } from '../../../../hooks/connectedWeb3'
import { MarketMakerDataItem } from '../../../../queries/markets_home'
import { ERC20Service } from '../../../../services'
import { calcPrice, formatBigNumber } from '../../../../util/tools'
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

export const ListItem: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { account, library: provider } = context
  const [volume, setVolume] = useState('')
  const [symbol, setSymbol] = useState('')
  const [dailyVolume, setDailyVolume] = useState('')
  const [liquidity, setLiquidity] = useState(0)

  const { currentFilter, market } = props
  const { address, collateralToken, collateralVolume, openingTimestamp, outcomeTokenAmounts, outcomes, title } = market

  const now = moment()
  const endDate = openingTimestamp
  const endsText = moment(endDate).fromNow(true)
  const resolutionDate = moment(endDate).format('MMM Do, YYYY')

  const useGraphMarketMakerDataResult = useGraphMarketMakerData(address, context.networkId)
  const creationTimestamp: string = useGraphMarketMakerDataResult.marketMakerData
    ? useGraphMarketMakerDataResult.marketMakerData.creationTimestamp
    : ''
  const creationDate = new Date(1000 * parseInt(creationTimestamp))
  const formattedCreationDate = moment(creationDate).format('MMM Do, YYYY')
  const lastActiveDay: number = useGraphMarketMakerDataResult.marketMakerData
    ? useGraphMarketMakerDataResult.marketMakerData.lastActiveDay
    : 0
  const dailyVolumeUnformatted: Maybe<BigNumber> = useGraphMarketMakerDataResult.marketMakerData
    ? useGraphMarketMakerDataResult.marketMakerData.dailyVolume
    : null

  useEffect(() => {
    const setToken = async () => {
      const erc20Service = new ERC20Service(provider, account, collateralToken)
      const { decimals, symbol } = await erc20Service.getProfileSummary()
      const volume = formatBigNumber(collateralVolume, decimals)

      let lastDayVolume: BigNumber
      let formattedDailyVolume: string
      if (dailyVolumeUnformatted !== null) {
        lastDayVolume = dailyVolumeUnformatted
        formattedDailyVolume = formatBigNumber(lastDayVolume, decimals)
      } else {
        formattedDailyVolume = '0'
      }

      let liquidity = 0
      outcomeTokenAmounts.forEach(amount => {
        const formattedAmount: number = parseInt(formatBigNumber(amount, decimals))
        liquidity += formattedAmount
      })

      setVolume(volume)
      setSymbol(symbol)
      setDailyVolume(formattedDailyVolume)
      setLiquidity(liquidity)
    }

    setToken()
  }, [account, collateralToken, collateralVolume, dailyVolumeUnformatted, provider, outcomeTokenAmounts])

  const percentages = calcPrice(outcomeTokenAmounts)
  const indexMax = percentages.indexOf(Math.max(...percentages))

  return (
    <Wrapper to={`/${address}`}>
      <Title>{title}</Title>
      <Info>
        <IconStar></IconStar>
        <Outcome>{outcomes && `${outcomes[indexMax]} (${(percentages[indexMax] * 100).toFixed(2)}%)`}</Outcome>
        <Separator>|</Separator>
        <span>{moment(endDate).isAfter(now) ? `${endsText} remaining` : `Ended ${endsText}`}</span>
        <Separator>|</Separator>
        <span>
          {currentFilter.sortBy === 'scaledCollateralVolume' && `${volume} ${symbol} - Volume`}
          {currentFilter.sortBy === 'openingTimestamp' && `${resolutionDate} - Ending`}
          {currentFilter.sortBy === 'lastActiveDayAndScaledRunningDailyVolume' &&
            `${Math.floor(Date.now() / 86400000) === lastActiveDay ? dailyVolume : 0} ${symbol} - 24hr Volume`}
          {currentFilter.sortBy === 'scaledLiquidityParameter' && `${liquidity} ${symbol} - Liquidity`}
          {currentFilter.sortBy === 'creationTimestamp' && `${formattedCreationDate} - Created`}
        </span>
      </Info>
    </Wrapper>
  )
}
