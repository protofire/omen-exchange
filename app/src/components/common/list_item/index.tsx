import React, { HTMLAttributes, useEffect, useState } from 'react'
import styled, { css } from 'styled-components'
import { MarketWithExtraData, MarketStatus } from '../../../util/types'
import { formatDate, calcPrice } from '../../../util/tools'
import { CalendarIcon } from '../calendar_icon'
import { ChevronRightIcon } from '../chevron_right_icon'
import { NavLink } from 'react-router-dom'
import { ERC20Service } from '../../../services'
import { ethers } from 'ethers'
import { useConnectedWeb3Context } from '../../../hooks/connectedWeb3'
import moment from 'moment'

const ListItemCss = css`
  align-items: center;
  border-bottom: 1px solid ${props => props.theme.borders.borderColor};
  display: flex;
  justify-content: space-between;
  padding: 15px ${props => props.theme.cards.paddingHorizontal};

  &:last-child {
    border-bottom: none;
  }

  &:active,
  &:hover {
    background-color: ${props => props.theme.colors.activeListItemBackground};
  }
`

const ListItemWrapperWithLink = styled(NavLink)`
  cursor: pointer;
  ${ListItemCss}
`

const Contents = styled.div`
  flex-grow: 1;
  padding: 0 20px 0 0;
`

const Title = styled.h1`
  color: #000;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.33;
  margin: 0 0 5px 0;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    margin-bottom: 0;
  }
`

const Info = styled.div`
  display: flex;
  flex-direction: column;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    align-items: center;
    flex-direction: row;
  }
`

const ResolutionDate = styled.div`
  align-items: center;
  color: ${props => props.theme.colors.textColorLight};
  display: flex;
  font-size: 13px;
  font-weight: normal;
  line-height: 1.2;
  flex-wrap: wrap;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    flex-wrap: nowrap;
  }
`

const Bold = styled.div`
  font-weight: 700;
`

const CalendarIconStyled = styled(CalendarIcon)`
  margin: -2px 5px 0 0;
`

const ResolutionText = styled.div`
  margin: 0 0 0 18px;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    margin-left: 5px;
  }
`

const Separator = styled.div`
  display: none;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    color: ${props => props.theme.colors.textColorLight};
    display: block;
    font-size: 13px;
    font-weight: normal;
    line-height: 1.2;
    margin: 0 5px;
  }
`

interface StatusProps {
  resolved?: boolean
}

const Status = styled.div<StatusProps>`
  color: ${props =>
    props.resolved ? props.theme.colors.textColorLight : props.theme.colors.primary};
  font-size: 13px;
  font-weight: 500;
  line-height: 1.38;
  margin: 0 0 0 18px;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    margin-left: 0;
  }
`

const Chevron = styled(ChevronRightIcon)`
  flex-grow: 0;
  flex-shrink: 0;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  market: any
}

interface ListItemWrapperProps {
  address: string
  children: React.ReactNode
}

const ListItemWrapper: React.FC<ListItemWrapperProps> = (props: ListItemWrapperProps) => {
  const { address, children } = props

  return <ListItemWrapperWithLink to={address}>{children}</ListItemWrapperWithLink>
}

export const ListItem: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { library: provider, account } = context
  const [amount, setAmount] = useState('')
  const [symbol, setSymbol] = useState('')

  const { market } = props
  const { id: address, collateralToken, collateralVolume, outcomeTokenAmounts } = market

  const { question } = market.conditions[0]
  const { title, outcomes } = question

  const endsIn = moment(new Date(question.openingTimestamp * 1000)).fromNow() // TODO Add function to calculate for past markets

  useEffect(() => {
    const setToken = async () => {
      if (!account) {
        return
      }
      const erc20Service = new ERC20Service(provider, account, collateralToken)
      const { symbol, decimals } = await erc20Service.getProfileSummary()

      const amount = ethers.utils.formatUnits(collateralVolume, decimals)

      setAmount(amount)
      setSymbol(symbol)
    }

    setToken()
  }, [collateralToken, account])

  const percentages = calcPrice(outcomeTokenAmounts)
  const indexMax = percentages.indexOf(Math.max(...percentages))

  return (
    <ListItemWrapper address={address}>
      <Contents>
        <Title>{title}</Title>
        <Info>
          <span>{`${(percentages[indexMax] * 100).toFixed(2)}% ${outcomes[indexMax]} `}</span>·{' '}
          <span>
            {amount} {symbol} Volume
          </span>
          <ResolutionDate>
            <CalendarIconStyled />
            <ResolutionText>Ends {endsIn}</ResolutionText>
          </ResolutionDate>
        </Info>
      </Contents>
      <Chevron />
    </ListItemWrapper>
  )
}
