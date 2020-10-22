import React from 'react'
import styled from 'styled-components'

import { Button } from '../../../button'

const TableWrapper = styled.div`
  text-align: left;
`
const Row = styled.div<{ width: string }>`
  width: ${props => props.width}%;
  padding-top: 0px;
  align-self: center;
  &:first-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-right: 10px;
  }
  &:last-child {
    text-align: end;
    color: #7986cb;
  }
`
const PaginationButton = styled(Button)<{ marginLeft?: string }>`
  padding: 12px 20px;
  ${props => (props.marginLeft ? `margin-left:${props.marginLeft}px;` : '')}
`
const Pagination = styled.div`
  display: flex;
  margin-top: 20px;
  margin-left: 24px;
  margin-right: 24px;
  margin-bottom: -5px;
`
const PaginationLeft = styled.div`
  justify-content: start;
  display: flex;
`
const PaginationRight = styled.div`
  display: flex;
  margin-left: auto;
`
const Column = styled.div`
  display: flex;
  padding: 20px 25px 20px 25px;
  border-bottom: 1px solid ${props => props.theme.borders.borderDisabled};
  font-family: Roboto;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
  color: #37474f;
  &:first-child {
    padding: 26px 25px 13px 25px;
    color: #757575 !important;
  }
`

export const MarketTable = () => {
  const dummyData = [
    {
      id: 1,
      user: '0x534545222a22345s431',
      action: 'withdraw',
      shared: 154,
      amount: 221,
      date: '21.10 - 01:00',
    },
    {
      id: 2,
      user: '0x5345452ddda22345s431',
      action: 'buy',
      shared: 121,
      amount: 178,
      date: '21.90 - 05:00',
    },
    {
      id: 3,
      user: '0x5345452ddda22345s431',
      action: 'sell',
      shared: 121,
      amount: 178,
      date: '21.90 - 05:00',
    },
    {
      id: 4,
      user: '0x5345452ddda22345s431',
      action: 'buy',
      shared: 121,
      amount: 178,
      date: '21.90 - 05:00',
    },
    {
      id: 5,
      user: '0x5345452ddda22345s431',
      action: 'add Liquidty',
      shared: 121,
      amount: 178,
      date: '21.90 - 05:00',
    },
    {
      id: 6,
      user: '0x5345452ddda22345s431',
      action: 'add Liquidty',
      shared: 121,
      amount: 178,
      date: '21.90 - 05:00',
    },
  ]
  return (
    <React.Fragment>
      <TableWrapper>
        <Column>
          <Row width={'24'}>User</Row>
          <Row width={'20'}>Action</Row>
          <Row width={'20'}>Shares/PT</Row>
          <Row width={'18'}>Amount(DAI)</Row>
          <Row width={'18'}>Date - UTC</Row>
        </Column>
        {dummyData.map(({ action, amount, date, id, shared, user }) => {
          return (
            <Column key={id}>
              <Row width={'24'}>{user}</Row>
              <Row width={'20'}>{action}</Row>
              <Row width={'20'}>{shared}</Row>
              <Row width={'18'}>{amount}</Row>
              <Row width={'18'}>{date}</Row>
            </Column>
          )
        })}
      </TableWrapper>
      <Pagination>
        <PaginationLeft>
          <PaginationButton>Back</PaginationButton>
        </PaginationLeft>
        <PaginationRight>
          <PaginationButton>Prev</PaginationButton>
          <PaginationButton marginLeft={'12'}>Next</PaginationButton>
        </PaginationRight>
      </Pagination>
    </React.Fragment>
  )
}
