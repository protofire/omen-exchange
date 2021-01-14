import React from 'react'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'

import { FpmmTradeDataType } from '../../../../hooks/useGraphFpmmTransactionsFromQuestion'
import { formatBigNumber, formatHistoryDate, formatHistoryUser } from '../../../../util/tools'
import { Button } from '../../../button'
import { ConnectionIcon } from '../../../common/network/img/ConnectionIcon'

const TableWrapper = styled.div`
  text-align: left;
`
const HistoryColumns = styled.div<{ firstRow?: boolean }>`
  width: 20%;
  padding-top: 0px;
  align-self: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 10px;
  &:first-child {
    width: 23%;
    svg {
      margin-right: 10px;
      vertical-align: middle;
    }
  }
  &:last-child {
    padding-right: 0px;
    text-align: end;
    color: ${({ firstRow }) => (firstRow ? '' : '#7986cb')};
  }
  &:nth-child(4) {
    overflow: auto;
    text-overflow: unset;
    white-space: unset;
  }
`
const PaginationButton = styled(Button)<{ marginLeft?: string }>`
  padding: 12px 20px;
  ${props => (props.marginLeft ? `margin-left:${props.marginLeft}px;` : '')}
`
const Pagination = styled.div`
  display: flex;
  margin: 20px 24px 0 24px;
`
const PaginationLeft = styled.div`
  justify-content: start;
  display: flex;
`
const PaginationRight = styled.div`
  display: flex;
  margin-left: auto;
`
const HistoryRow = styled.div`
  display: flex;
  padding: 17px 25px;
  border-bottom: 1px solid ${props => props.theme.borders.borderDisabled};
  font-family: ${props => props.theme.fonts.fontFamily};
  font-size: ${props => props.theme.fonts.fontSize};
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
  color: ${props => props.theme.colors.textColorDark};
  &:first-child {
    padding: 13px 25px;
    color: ${props => props.theme.colors.textColor} !important;
  }
`

type Props = {
  fpmmTrade: FpmmTradeDataType[] | null
  status: string
  onLoadNextPage: () => void
  onLoadPrevPage: () => void
  currency: string
  next: boolean
  prev: boolean
}

enum EtherscanLink {
  rinkeby = 'https://rinkeby.etherscan.io/tx/',
  mainnet = 'https://etherscan.io/tx/',
}

export const HistoryTable: React.FC<Props> = ({
  currency,
  fpmmTrade,
  next,
  onLoadNextPage,
  onLoadPrevPage,
  prev,
  status,
}) => {
  const history = useHistory()

  const windowObj: any = window

  return (
    <React.Fragment>
      <TableWrapper>
        <HistoryRow>
          <HistoryColumns>User</HistoryColumns>
          <HistoryColumns>Action</HistoryColumns>
          <HistoryColumns>Shares/PT</HistoryColumns>
          <HistoryColumns>Amount ({currency})</HistoryColumns>
          <HistoryColumns firstRow={true}>Date - UTC</HistoryColumns>
        </HistoryRow>
        {status === 'Ready' &&
          fpmmTrade &&
          fpmmTrade.map(
            ({
              collateralTokenAmount,
              creationTimestamp,
              decimals,
              id,
              sharesOrPoolTokenAmount,
              transactionHash,
              transactionType,
              user,
            }) => {
              const chainID = windowObj.ethereum.chainId

              const mainnetOrRinkebyUrl =
                chainID === '0x4' ? EtherscanLink.rinkeby : chainID === '0x1' ? EtherscanLink.mainnet : ''
              return (
                <HistoryRow key={id}>
                  <HistoryColumns>
                    <ConnectionIcon size={'22'} />
                    <span>{formatHistoryUser(user.id)}</span>
                  </HistoryColumns>
                  <HistoryColumns>{transactionType}</HistoryColumns>
                  <HistoryColumns>{formatBigNumber(sharesOrPoolTokenAmount, decimals, 3)}</HistoryColumns>
                  <HistoryColumns>
                    {formatBigNumber(collateralTokenAmount, decimals, 3)}
                    {` ${currency}`}
                  </HistoryColumns>
                  <HistoryColumns as="a" href={mainnetOrRinkebyUrl + transactionHash} target="_blank">
                    {formatHistoryDate(creationTimestamp)}
                  </HistoryColumns>
                </HistoryRow>
              )
            },
          )}
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
          <PaginationButton disabled={prev} onClick={onLoadPrevPage}>
            Prev
          </PaginationButton>
          <PaginationButton disabled={next} marginLeft={'12'} onClick={onLoadNextPage}>
            Next
          </PaginationButton>
        </PaginationRight>
      </Pagination>
    </React.Fragment>
  )
}
