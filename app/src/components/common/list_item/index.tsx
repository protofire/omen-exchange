import { ethers } from 'ethers'
import moment from 'moment'
import React, { HTMLAttributes, useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

import { useConnectedWeb3Context } from '../../../hooks/connectedWeb3'
import { ERC20Service } from '../../../services'
import { calcPrice } from '../../../util/tools'

const Wrapper = styled(NavLink)`
  border-bottom: 1px solid ${props => props.theme.borders.borderColor};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 22px 25px;

  &:active,
  &:hover {
    background-color: ${props => props.theme.colors.activeListItemBackground};
  }
`

const Title = styled.h2`
  color: ${props => props.theme.colors.textColorDarker};
  font-size: 15px;
  font-weight: 500;
  line-height: 1.2;
  margin: 0 0 5px 0;
`

const Info = styled.div`
  align-items: center;
  color: ${props => props.theme.colors.textColor};
  display: flex;
  flex-wrap: wrap;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
`

const Outcome = styled.span`
  color: ${props => props.theme.colors.primary};
`

const Separator = styled.span`
  font-size: 18px;
  margin: 0 5px;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  market: any
}

export const ListItem: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { account, library: provider } = context
  const [amount, setAmount] = useState('')
  const [symbol, setSymbol] = useState('')

  const { market } = props
  const {
    collateralToken,
    collateralVolume,
    id: address,
    openingTimestamp,
    outcomeTokenAmounts,
    outcomes,
    title,
  } = market

  const now = moment()
  const endDate = new Date(openingTimestamp * 1000)
  const endsText = moment(endDate).fromNow()

  useEffect(() => {
    const setToken = async () => {
      if (!account) {
        return
      }
      const erc20Service = new ERC20Service(provider, account, collateralToken)
      const { decimals, symbol } = await erc20Service.getProfileSummary()

      const amount = ethers.utils.formatUnits(collateralVolume, decimals)

      setAmount(amount)
      setSymbol(symbol)
    }

    setToken()
  }, [collateralToken, account, collateralVolume, provider])

  const percentages = calcPrice(outcomeTokenAmounts)
  const indexMax = percentages.indexOf(Math.max(...percentages))

  return (
    <Wrapper to={address}>
      <Title>{title}</Title>
      <Info>
        <Outcome>{outcomes && `${(percentages[indexMax] * 100).toFixed(2)}% ${outcomes[indexMax]} `}</Outcome>
        <Separator>·</Separator>
        <span>
          {amount} {symbol} Volume
        </span>
        <Separator>·</Separator>
        <span>{moment(endDate).isAfter(now) ? `Ends ${endsText}` : `Ended ${endsText}`}</span>
      </Info>
    </Wrapper>
  )
}
