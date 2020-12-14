import { BigNumber, bigNumberify } from 'ethers/utils'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import styled, { css } from 'styled-components'

import { useConnectedWeb3Context, useContracts } from '../../../../hooks'
import {
  FpmmTradeDataType,
  useGraphFpmmTransactionsFromQuestion,
} from '../../../../hooks/useGraphFpmmTransactionsFromQuestion'
import { CPKService } from '../../../../services'
import { calcPrice, calcSellAmountInCollateral, calculateSharesBought, formatBigNumber } from '../../../../util/tools'
import { HistoricData, Period } from '../../../../util/types'
import { Button, ButtonSelectable } from '../../../button'
import { Dropdown, DropdownPosition } from '../../../common/form/dropdown'
import { InlineLoading } from '../../../loading'
import { HistoryChart } from '../history_chart'
import { HistoryTable } from '../history_table'

const commonWrapperCSS = css`
  border-top: 1px solid ${props => props.theme.borders.borderDisabled};
  margin-left: -${props => props.theme.cards.paddingHorizontal};
  margin-right: -${props => props.theme.cards.paddingHorizontal};
  width: auto;
`
const DropdownMenu = styled(Dropdown)`
  margin-left: auto;
  width: 33%;
`

const NoData = styled.div`
  ${commonWrapperCSS};
  align-items: center;
  color: ${props => props.theme.colors.textColorDarker};
  display: flex;
  font-size: 15px;
  font-weight: 400;
  height: 340px;
  justify-content: center;
  letter-spacing: 0.4px;
  line-height: 1.3;
  padding-left: ${props => props.theme.cards.paddingHorizontal};
  padding-right: ${props => props.theme.cards.paddingHorizontal};
`

const CustomInlineLoading = styled(InlineLoading)`
  ${commonWrapperCSS};
  height: 340px;
`

const ChartWrapper = styled.div`
  ${commonWrapperCSS}
`

const TitleWrapper = styled.div`
  align-items: center;
  border-bottom: 1px solid ${props => props.theme.borders.borderDisabled};
  display: flex;
  margin: 0;
  padding: 20px 24px;
`

const ButtonsWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: space-between;
  margin-left: 80px;
`

const SelectWrapper = styled.div`
  display: flex;
`

type Props = {
  holdingSeries: Maybe<HistoricData>
  onChange: (s: Period) => void
  options: Period[]
  outcomes: string[]
  value: Period
  currency: string
  marketMakerAddress: string
  decimals: number
  fee: BigNumber
}

const ButtonSelectableStyled = styled(ButtonSelectable)<{ active?: boolean }>`
  color: ${props => (props.active ? props.theme.colors.primary : props.theme.colors.clickable)};
  font-weight: 500;
  margin-left: 5px;

  &:first-child {
    margin-left: 0;
  }
`
const ButtonSelect = styled(Button)<{ active: boolean }>`
  margin-right: 10px;
  padding: 20px 15px;
  ${props => (props.active ? `border-color:${props.theme.colors.borderColorDark}` : '')};
`

const timestampToDate = (timestamp: number, value: string) => {
  const ts = moment(timestamp * 1000)
  if (value === '1D' || value === '1H') return ts.format('HH:mm')

  return ts.format('MMM D')
}

export const HistorySelect: React.FC<Props> = ({
  currency,
  decimals,
  fee,
  holdingSeries,
  marketMakerAddress,
  onChange,
  options,
  outcomes,
  value,
}) => {
  const context = useConnectedWeb3Context()
  const { library: provider } = context
  const contracts = useContracts(context)
  const { buildMarketMaker } = contracts
  const marketMaker = buildMarketMaker(marketMakerAddress)
  const [sharesData, setSharesData] = useState<FpmmTradeDataType[]>([])
  const [sharesDataLoader, setSharesDataLoader] = useState<boolean>(true)

  const data =
    holdingSeries &&
    holdingSeries
      .filter(h => !!h.block)
      .sort((a, b) => a.block.timestamp - b.block.timestamp)
      .map(h => {
        const prices = calcPrice(h.holdings.map(bigNumberify))
        const outcomesPrices: { [outcomeName: string]: number } = {}
        outcomes.forEach((k, i) => (outcomesPrices[k] = prices[i]))

        return { ...outcomesPrices, date: timestampToDate(h.block.timestamp, value) }
      })
  const [toogleSelect, setToogleSelect] = useState(true)
  const [type, setType] = useState(0)
  const DropdownItems = [
    {
      content: 'All',
      onClick: () => {
        setType(0)
      },
    },
    {
      content: 'Liquidity',
      onClick: () => {
        setType(1)
      },
    },
    {
      content: 'Trades',
      onClick: () => {
        setType(2)
      },
    },
  ]
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize] = useState(6)
  const marketFeeWithTwoDecimals = Number(formatBigNumber(fee, 18))
  const { fpmmTrade, paginationNext, refetch, status } = useGraphFpmmTransactionsFromQuestion(
    marketMakerAddress,
    pageSize,
    pageIndex,
    type,
    decimals,
  )

  useEffect(() => {
    setSharesDataLoader(true)
    ;(async () => {
      if (fpmmTrade) {
        const cpk = await CPKService.create(provider)
        const response: any[] = await Promise.all(
          fpmmTrade.map(async item => {
            if (item.fpmmType === 'Liquidity') {
              const block: any = await marketMaker.getBlockNumber(item.transactionHash)

              return {
                blockNumber: block,
                id: item.id,
                amount: item.collateralTokenAmount,
                fpmmType: item.fpmmType,
                poolShares: await marketMaker.poolSharesTotalSupplyByBlockNumber(block.blockNumber),
                balances: await marketMaker.getBalanceInformationByBlock(
                  marketMakerAddress,
                  outcomes.length,
                  block.blockNumber,
                ),
                shares: await marketMaker.getBalanceInformationByBlock(cpk.address, outcomes.length, block.blockNumber),
                collateralTokenAmount: new BigNumber(item.collateralTokenAmount),
              }
            }
            return {}
          }),
        )
        const newFpmmTradeArray: any[] = []
        fpmmTrade.forEach(item => {
          if (item.fpmmType === 'Liquidity') {
            let sharesValue
            const findInResponse = response.find(element => element.id === item.id)
            if (findInResponse) {
              const { balances, collateralTokenAmount, poolShares, shares } = findInResponse
              let firstItem = balances[0]
              let outcomeIndex = 0

              balances.forEach((item: BigNumber, index: number) => {
                if (item.lt(firstItem)) {
                  firstItem = item
                  outcomeIndex = index
                }
              })
              const holdingsOfOtherOutcomes = balances.filter((item: BigNumber, index: number) => {
                return index !== outcomeIndex
              })

              const sharesCalculation = calculateSharesBought(poolShares, balances, shares, collateralTokenAmount)

              sharesValue = calcSellAmountInCollateral(
                sharesCalculation,
                firstItem,
                holdingsOfOtherOutcomes,
                marketFeeWithTwoDecimals,
              )

              if (Number(sharesCalculation) !== 0) {
                newFpmmTradeArray.push({
                  sharesOrPoolTokenAmount: formatBigNumber(sharesCalculation, decimals, 3),
                  decimals: item.decimals,
                  collateralTokenAmount: sharesValue && sharesValue,
                  creationTimestamp: item.creationTimestamp,
                  id: item.id + 1,
                  transactionHash: item.transactionHash,
                  transactionType: item.transactionType === 'Deposit' ? 'Buy' : 'Sell',
                  user: item.user,
                })
              }
            }

            const collateralBigNumber = new BigNumber(item.collateralTokenAmount)

            newFpmmTradeArray.push({
              sharesOrPoolTokenAmount: item.sharesOrPoolTokenAmount,
              decimals: item.decimals,
              creationTimestamp: item.creationTimestamp,
              id: item.id,
              collateralTokenAmount: sharesValue ? collateralBigNumber.sub(sharesValue) : collateralBigNumber,
              transactionHash: item.transactionHash,
              transactionType: item.transactionType,
              user: item.user,
            })
          } else {
            newFpmmTradeArray.push(item)
          }
        })

        setSharesDataLoader(false)
        setSharesData(newFpmmTradeArray)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fpmmTrade])

  useEffect(() => {
    setPageIndex(0)
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type])
  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const loadNextPage = () => {
    const newPageIndex = pageIndex + pageSize
    setSharesDataLoader(true)
    if (!paginationNext) {
      return
    }
    setPageIndex(newPageIndex)
  }
  const loadPrevPage = () => {
    if (pageIndex < 1) {
      return
    }
    const newPageIndex = pageIndex - pageSize
    setPageIndex(newPageIndex)
  }

  if (!data || status === 'Loading' || sharesDataLoader) {
    return <CustomInlineLoading message="Loading Trade History" />
  }

  if (holdingSeries && holdingSeries.length <= 1) {
    return <NoData>There is not enough historical data for this market</NoData>
  }

  return (
    <ChartWrapper>
      <TitleWrapper>
        <SelectWrapper>
          <ButtonSelect active={toogleSelect} onClick={() => setToogleSelect(true)}>
            Activities
          </ButtonSelect>
          <ButtonSelect active={!toogleSelect} onClick={() => setToogleSelect(false)}>
            Graph
          </ButtonSelect>
        </SelectWrapper>

        {toogleSelect ? (
          <DropdownMenu currentItem={type} dropdownPosition={DropdownPosition.right} items={DropdownItems} />
        ) : (
          <ButtonsWrapper>
            {options.map((item, index) => {
              return (
                <ButtonSelectableStyled active={value === item} key={index} onClick={() => onChange(item)}>
                  {item}
                </ButtonSelectableStyled>
              )
            })}
          </ButtonsWrapper>
        )}
      </TitleWrapper>
      {toogleSelect ? (
        <HistoryTable
          currency={currency}
          fpmmTrade={sharesData}
          next={!paginationNext}
          onLoadNextPage={loadNextPage}
          onLoadPrevPage={loadPrevPage}
          prev={pageIndex < 1}
          status={status}
        />
      ) : (
        <HistoryChart data={data} outcomes={outcomes} />
      )}
    </ChartWrapper>
  )
}
