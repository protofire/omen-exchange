import React from 'react'
import styled from 'styled-components'

import { FpmmTradeDataType } from '../../../../hooks/useGraphFpmmTradesFromQuestion'
import { Button } from '../../../button'
import { ConnectionIcon } from '../../../common/network/img/ConnectionIcon'

const TableWrapper = styled.div`
  text-align: left;
`
const Row = styled.div<{ width: string; firstRow?: boolean }>`
  width: ${props => props.width}%;
  padding-top: 0px;
  align-self: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 10px;
  &:first-child {
    svg {
      margin-right: 10px;
      vertical-align: sub;
    }
  }
  &:last-child {
    padding-right: 0px;
    text-align: end;
    color: ${({ firstRow }) => (firstRow ? '' : '#7986cb')};
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

type Props = {
  fpmmTrade: FpmmTradeDataType[] | null
  status: string
}

export const MarketTable: React.FC<Props> = ({ fpmmTrade, status }) => {
  console.log(fpmmTrade)
  return (
    <React.Fragment>
      <TableWrapper>
        <Column>
          <Row width={'24'}>User</Row>
          <Row width={'20'}>Action</Row>
          <Row width={'20'}>Shares/PT</Row>
          <Row width={'18'}>Amount(DAI)</Row>
          <Row firstRow={true} width={'18'}>
            Date - UTC
          </Row>
        </Column>
        {status === 'Ready' &&
          fpmmTrade &&
          fpmmTrade.map(({ collateralAmountUSD, creationTimestamp, creator, id, outcomeTokensTraded, type }) => {
            const date = new Date(creationTimestamp)
            const formattedDate = `${date.getDate()}.${date.getMonth()}-${date.getHours()}:${date.getMinutes()}`

            return (
              <Column key={id}>
                <Row width={'24'}>
                  <ConnectionIcon />
                  <span>{creator}</span>
                </Row>
                <Row width={'20'}>{type}</Row>
                <Row width={'20'}>{outcomeTokensTraded}</Row>
                <Row width={'18'}>{collateralAmountUSD}</Row>
                <Row width={'18'}>{formattedDate}</Row>
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
