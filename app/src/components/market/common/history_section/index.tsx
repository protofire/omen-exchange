import { Block } from 'ethers/providers'
import { BigNumber } from 'ethers/utils'
import moment from 'moment'
import React, { useEffect, useMemo, useState } from 'react'

import { EARLIEST_MAINNET_BLOCK_TO_CHECK, EARLIEST_RINKEBY_BLOCK_TO_CHECK } from '../../../../common/constants'
import { useConnectedWeb3Context, useMultipleQueries } from '../../../../hooks'
import { isScalarMarket, keys, range, waitABit } from '../../../../util/tools'
import { Period } from '../../../../util/types'

import { History_select } from './history_select'

// This query will return an object where each entry is
// `fixedProductMarketMaker_X: { outcomeTokenAmounts }`,
// where X is a block number,
//  and `outcomeTokenAmounts` is the amount of holdings of the market maker at that block.
const buildQueriesHistory = (blockNumbers: number[]) => {
  return blockNumbers.map(
    blockNumber => `query fixedProductMarketMaker_${blockNumber}($id: ID!) {
      fixedProductMarketMaker(id: $id, block: { number: ${blockNumber} }) {
        outcomeTokenAmounts
      }
    }
    `,
  )
}

type HistoricDataPoint = {
  block: Block
  holdings: string[]
}

type HistoricData = HistoricDataPoint[]

const useHoldingsHistory = (marketMakerAddress: string, blocks: Maybe<Block[]>): Maybe<HistoricData> => {
  const queries = useMemo(() => (blocks ? buildQueriesHistory(blocks.map(block => block.number)) : null), [blocks])
  const variables = useMemo(() => {
    return { id: marketMakerAddress }
  }, [marketMakerAddress])

  const queriesResult = useMultipleQueries<{ data: { [key: string]: { outcomeTokenAmounts: string[] } } }>(
    queries,
    variables,
  )

  if (queriesResult && blocks) {
    const result: HistoricData = []
    queriesResult
      .filter(d => d.data)
      .forEach((queryResult, index) => {
        Object.values(queryResult.data).forEach(value => {
          if (value && value.outcomeTokenAmounts) {
            const block = blocks[index]
            const holdings = value.outcomeTokenAmounts
            result.push({ block, holdings })
          }
        })
      })

    return result
  }
  return null
}

type Props = {
  answerFinalizedTimestamp: Maybe<BigNumber>
  marketMakerAddress: string
  hidden: boolean
  outcomes: string[]
  oracle: Maybe<string>
  currency: string
  fee: BigNumber
  decimals: number
  scalarHigh: Maybe<BigNumber>
  scalarLow: Maybe<BigNumber>
  unit: string
}

const blocksPerAllTimePeriod = 10000
const blocksPerDay = 5760
const blocksPerHour = Math.floor(blocksPerDay / 24)
const blocksPerMinute = Math.floor(blocksPerHour / 60)

const calcOffsetByDate = (nowOrClosedTs: number) => {
  const now = moment()
  const offsetInMinutes = moment(nowOrClosedTs)
    .startOf('day')
    .diff(now, 'minute')

  return -offsetInMinutes * blocksPerMinute
}

export const HistorySelectContainer: React.FC<Props> = ({
  answerFinalizedTimestamp,
  currency,
  decimals,
  fee,
  hidden,
  marketMakerAddress,
  oracle,
  outcomes,
  scalarHigh,
  scalarLow,
  unit,
}) => {
  const { library, networkId } = useConnectedWeb3Context()
  const [latestBlockNumber, setLatestBlockNumber] = useState<Maybe<number>>(null)

  const [blocks, setBlocks] = useState<Maybe<Block[]>>(null)
  const holdingsSeries = useHoldingsHistory(marketMakerAddress, blocks)
  const [period, setPeriod] = useState<Period>('1M')

  const blocksOffset = useMemo(
    () => (answerFinalizedTimestamp ? calcOffsetByDate(answerFinalizedTimestamp.toNumber() * 1000) : 0),
    [answerFinalizedTimestamp],
  )

  const earliestBlock = networkId === 1 ? EARLIEST_MAINNET_BLOCK_TO_CHECK : EARLIEST_RINKEBY_BLOCK_TO_CHECK
  const blocksSinceInception = latestBlockNumber ? latestBlockNumber - earliestBlock : 0
  const allDataPoints = Math.floor(blocksSinceInception / blocksPerAllTimePeriod)

  const mapPeriod: { [period in Period]: { totalDataPoints: number; blocksPerPeriod: number } } = {
    All: { totalDataPoints: allDataPoints, blocksPerPeriod: blocksPerAllTimePeriod },
    '1Y': { totalDataPoints: 365, blocksPerPeriod: blocksPerDay },
    '1M': { totalDataPoints: 30, blocksPerPeriod: blocksPerDay },
    '1W': { totalDataPoints: 7, blocksPerPeriod: blocksPerDay },
    '1D': { totalDataPoints: 24, blocksPerPeriod: blocksPerHour },
    '1H': { totalDataPoints: 60, blocksPerPeriod: blocksPerMinute },
  }

  useEffect(() => {
    library.getBlockNumber().then((latest: number) => setLatestBlockNumber(latest - blocksOffset))
  }, [blocksOffset, library])

  useEffect(() => {
    const getBlocks = async (latestBlockNumber: number) => {
      const { blocksPerPeriod, totalDataPoints } = mapPeriod[period]
      if (latestBlockNumber) {
        const blockNumbers = range(totalDataPoints).map(multiplier => latestBlockNumber - multiplier * blocksPerPeriod)
        const blocks = await Promise.all(
          blockNumbers.map(async blockNumber => {
            let block
            while (!block) {
              try {
                block = await library.getBlock(blockNumber)
              } catch (e) {
                await waitABit()
              }
            }
            return block
          }),
        )
        setBlocks(blocks.filter(block => block))
      }
    }

    if (latestBlockNumber) {
      getBlocks(latestBlockNumber)
    }
    // eslint-disable-next-line
  }, [latestBlockNumber, library, period])

  const isScalar = isScalarMarket(oracle || '', networkId || 0)

  return hidden ? null : (
    <History_select
      currency={currency}
      decimals={decimals}
      fee={fee}
      holdingSeries={holdingsSeries}
      isScalar={isScalar}
      marketMakerAddress={marketMakerAddress}
      onChange={setPeriod}
      options={keys(mapPeriod)}
      outcomes={outcomes}
      scalarHigh={scalarHigh}
      scalarLow={scalarLow}
      unit={unit}
      value={period}
    />
  )
}
