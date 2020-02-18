import React, { HTMLAttributes } from 'react'
import styled, { css } from 'styled-components'
import { MarketWithExtraData, MarketStatus } from '../../../util/types'
import { formatDate } from '../../../util/tools'
import { CalendarIcon } from '../calendar_icon'
import { ChevronRightIcon } from '../chevron_right_icon'
import { NavLink } from 'react-router-dom'

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
`

const Info = styled.div`
  display: flex;
  flex-direction: column;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    flex-direction: row;
  }
`

const TextWrapper = styled.div`
  p {
    color: #999999;
    font-size: 13px;
    margin: 0 0 3px;
    line-height: 18px;

    strong {
      font-weight: bold;
    }
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
  data: MarketWithExtraData
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
  const { data } = props
  const { address, question, resolution, status } = data

  return (
    <ListItemWrapper address={address}>
      <Contents>
        <Title>{question}</Title>
        {/* harcoded text */}
        <TextWrapper>
          <p>
            Current Prediction: <strong>60% YES</strong>
          </p>
          <p>
            End in <strong>2 days</strong>
          </p>
          <p>
            <strong>155,234.00</strong> DAI Volume / <strong>100,000.00</strong> DAI at Stake /{' '}
            <strong>2,000.00</strong> Pool Shares
          </p>
        </TextWrapper>
        <Info>
          <ResolutionDate>
            <CalendarIconStyled />
            <Bold>Resolution Date:</Bold>
            <ResolutionText>{resolution ? formatDate(resolution) : ''}</ResolutionText>
          </ResolutionDate>
          <Separator>-</Separator>
          <Status resolved={status === MarketStatus.Closed}>{status}</Status>
        </Info>
      </Contents>
      <Chevron />
    </ListItemWrapper>
  )
}
