import React from 'react'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'

import { FpmmTradeDataType } from '../../../../hooks/useGraphFpmmTransactionsFromQuestion'
import { formatNumber } from '../../../../util/tools'
import { Button } from '../../../button'
import { ConnectionIcon } from '../../../common/network/img/ConnectionIcon'

const TableWrapper = styled.div`
  text-align: left;
`
const HistoryRow = styled.div<{ width: string; firstRow?: boolean }>`
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
  margin: 20px 24px -5px;
`
const PaginationLeft = styled.div`
  justify-content: start;
  display: flex;
`
const PaginationRight = styled.div`
  display: flex;
  margin-left: auto;
`
const HistoryColumns = styled.div`
  display: flex;
  padding: 20px 25px 20px 25px;
  border-bottom: 1px solid ${props => props.theme.borders.borderDisabled};
  font-family: ${props => props.theme.fonts.fontFamily};
  font-size: ${props => props.theme.fonts.fontSize};
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
  color: ${props => props.theme.colors.textColorDark};
  &:first-child {
    padding: 26px 25px 13px 25px;
    color: ${props => props.theme.colors.textColor} !important;
  }
`

type Props = {
  fpmmTrade: FpmmTradeDataType[] | null
  status: string
  onLoadNextPage: () => void
  onLoadPrevPage: () => void
}

export const HistoryTable: React.FC<Props> = ({ fpmmTrade, onLoadNextPage, onLoadPrevPage, status }) => {
  const history = useHistory()
  return (
    <React.Fragment>
      <TableWrapper>
        <HistoryColumns>
          <HistoryRow width={'24'}>User</HistoryRow>
          <HistoryRow width={'20'}>Action</HistoryRow>
          <HistoryRow width={'20'}>Shares/PT</HistoryRow>
          <HistoryRow width={'18'}>Amount(DAI)</HistoryRow>
          <HistoryRow firstRow={true} width={'18'}>
            Date - UTC
          </HistoryRow>
        </HistoryColumns>
        {status === 'Ready' &&
          fpmmTrade &&
          fpmmTrade.map(({ collateralAmount, collateralAmountUSD, creationTimestamp, id, transactionType, user }) => {
            const date = new Date(creationTimestamp)
            const formattedDate = `${date.getDate()}.${date.getMonth()}-${date.getHours()}:${date.getMinutes()}`

            return (
              <HistoryColumns key={id}>
                <HistoryRow width={'24'}>
                  <ConnectionIcon />
                  <span>{user}</span>
                </HistoryRow>
                <HistoryRow width={'20'}>{transactionType}</HistoryRow>
                <HistoryRow width={'20'}>{formatNumber(collateralAmount)}</HistoryRow>
                <HistoryRow width={'18'}>{collateralAmountUSD}</HistoryRow>
                <HistoryRow width={'18'}>{formattedDate}</HistoryRow>
              </HistoryColumns>
            )
          })}
      </TableWrapper>
      <Pagination>
        <PaginationLeft>
          <PaginationButton
            onClick={() => {
              history.goBack()
            }}
          >
            Back
          </PaginationButton>
        </PaginationLeft>
        <PaginationRight>
          <PaginationButton onClick={onLoadPrevPage}>Prev</PaginationButton>
          <PaginationButton marginLeft={'12'} onClick={onLoadNextPage}>
            Next
          </PaginationButton>
        </PaginationRight>
      </Pagination>
    </React.Fragment>
  )
}
