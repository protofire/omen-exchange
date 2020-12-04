import { formatUnits } from 'ethers/utils'
import React from 'react'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'

import { FpmmTradeDataType } from '../../../../hooks/useGraphFpmmTransactionsFromQuestion'
import { formatHistoryDate, formatHistoryUser } from '../../../../util/tools'
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
const HistoryColumns = styled.div`
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
        <HistoryColumns>
          <HistoryRow width={'25'}>User</HistoryRow>
          <HistoryRow width={'18'}>Action</HistoryRow>
          <HistoryRow width={'20'}>Shares/PT</HistoryRow>
          <HistoryRow width={'22'}>Amount ({currency})</HistoryRow>
          <HistoryRow firstRow={true} width={'18'}>
            Date - UTC
          </HistoryRow>
        </HistoryColumns>
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
                chainID === '0x4'
                  ? 'https://rinkeby.etherscan.io/tx/'
                  : chainID === '0x1'
                  ? 'https://etherscan.io/tx/'
                  : ''

              return (
                <HistoryColumns key={id}>
                  <HistoryRow width={'25'}>
                    <ConnectionIcon size={'22'} />
                    <span>{formatHistoryUser(user)}</span>
                  </HistoryRow>
                  <HistoryRow width={'18'}>{transactionType}</HistoryRow>
                  <HistoryRow width={'20'}>{sharesOrPoolTokenAmount}</HistoryRow>
                  <HistoryRow width={'22'}>
                    {parseFloat(formatUnits(collateralTokenAmount, decimals)).toFixed(2)}
                    {` ${currency}`}
                  </HistoryRow>
                  <HistoryRow as="a" href={mainnetOrRinkebyUrl + transactionHash} target="_blank" width={'18'}>
                    {formatHistoryDate(creationTimestamp)}
                  </HistoryRow>
                </HistoryColumns>
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
