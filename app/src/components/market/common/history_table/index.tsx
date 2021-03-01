import React from 'react'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'

import { FpmmTradeDataType } from '../../../../hooks/useGraphFpmmTransactionsFromQuestion'
import { formatBigNumber, formatHistoryDate, formatHistoryUser } from '../../../../util/tools'
import { ButtonRound } from '../../../button'
import { IconJazz } from '../../../common/icons/IconJazz'
import { InlineLoading } from '../../../loading/inline_loading'

const TableWrapper = styled.div`
  text-align: left;
`
const Address = styled.div`
  margin-left: 10px;
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
    display: flex;
    align-items: center;
  }
  &:last-child {
    padding-right: 0px;
    text-align: end;
    color: ${({ firstRow }) => (firstRow ? '' : '#7986cb')};
    &:hover {
      ${({ firstRow, theme }) => (firstRow ? '' : `color:${theme.colors.primaryLight};`)};
    }
  }
  &:nth-child(4) {
    overflow: auto;
    text-overflow: unset;
    white-space: unset;
  }
`
const PaginationButton = styled(ButtonRound)<{ marginLeft?: string }>`
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

export const CustomInlineLoading = styled(InlineLoading)`
  width: auto;
  height: 340px;
`

type Props = {
  fpmmTrade: FpmmTradeDataType[] | null
  status: string
  onLoadNextPage: () => void
  onLoadPrevPage: () => void
  currency: string
  next: boolean
  prev: boolean
  sharesDataLoader: boolean
}

enum EtherscanLink {
  rinkeby = 'https://rinkeby.etherscan.io/tx/',
  mainnet = 'https://etherscan.io/tx/',
  xDai = 'https://blockscout.com/poa/xdai/tx/',
}

export const HistoryTable: React.FC<Props> = ({
  currency,
  fpmmTrade,
  next,
  onLoadNextPage,
  onLoadPrevPage,
  prev,
  sharesDataLoader,
  status,
}) => {
  const history = useHistory()

  const windowObj: any = window

  if (!fpmmTrade || status === 'Loading' || sharesDataLoader) {
    return <CustomInlineLoading message="Loading Trade History" />
  }
  const formattedCurrency = currency === 'WETH' ? 'ETH' : currency === 'WXDAI' ? 'XDAI' : currency
  return (
    <React.Fragment>
      <TableWrapper>
        <HistoryRow>
          <HistoryColumns>User</HistoryColumns>
          <HistoryColumns>Action</HistoryColumns>
          <HistoryColumns>Shares/PT</HistoryColumns>
          <HistoryColumns>Amount ({formattedCurrency})</HistoryColumns>
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
                chainID === '0x4'
                  ? EtherscanLink.rinkeby
                  : chainID === '0x1'
                  ? EtherscanLink.mainnet
                  : EtherscanLink.xDai
              return (
                <HistoryRow key={id}>
                  <HistoryColumns>
                    <IconJazz account={user.id} size={22} />
                    <Address>{formatHistoryUser(user.id)}</Address>
                  </HistoryColumns>
                  <HistoryColumns>{transactionType}</HistoryColumns>
                  <HistoryColumns>{formatBigNumber(sharesOrPoolTokenAmount, decimals, 3)}</HistoryColumns>
                  <HistoryColumns>
                    {formatBigNumber(collateralTokenAmount, decimals, 3)}
                    {` ${formattedCurrency}`}
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
