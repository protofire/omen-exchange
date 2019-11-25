import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'
import { MarketWithExtraData, MarketStatus } from '../../../util/types'
import { formatDate } from '../../../util/tools'
import { CalendarIcon } from '../calendar_icon'
import { ChevronRightIcon } from '../chevron_right_icon'
import { NavLink } from 'react-router-dom'

const ListItemWrapper = styled(NavLink)`
  align-items: center;
  border-bottom: 1px solid ${props => props.theme.borders.borderColor};
  cursor: pointer;
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

const Status = styled.div<{ resolved?: boolean }>`
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

export const ListItem: React.FC<Props> = (props: Props) => {
  const { data } = props
  return (
    <ListItemWrapper to={`${data.address}`}>
      <Contents>
        <Title>{data.question}</Title>
        <Info>
          <ResolutionDate>
            <CalendarIconStyled />
            <Bold>Resolution Date:</Bold>
            <ResolutionText>{data.resolution ? formatDate(data.resolution) : ''}</ResolutionText>
          </ResolutionDate>
          <Separator>-</Separator>
          <Status resolved={data.status === MarketStatus.Resolved ? true : false}>
            {data.status}
          </Status>
        </Info>
      </Contents>
      <Chevron />
    </ListItemWrapper>
  )
}
