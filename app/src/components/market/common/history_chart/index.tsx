import { useQuery } from '@apollo/react-hooks'
import { Block } from 'ethers/providers'
import { BigNumber } from 'ethers/utils'
import gql from 'graphql-tag'
import moment from 'moment'
import React, { useEffect, useMemo, useState } from 'react'
import { useWeb3Context } from 'web3-react'

import { keys, range } from '../../../../util/tools'
import { Period } from '../../../../util/types'

import { HistoryChart } from './chart'

// This query will return an object where each entry is
// `fixedProductMarketMaker_X: { outcomeTokenAmounts }`,
// where X is a block number,
//  and `outcomeTokenAmounts` is the amount of holdings of the market maker at that block.
const buildQueryHistory = (blockNumbers: number[]) => {
  const subqueries = blockNumbers.map(
    blockNumber => `
      fixedProductMarketMaker_${blockNumber}: fixedProductMarketMaker(id: $id, block: { number: ${blockNumber} }) {
        outcomeTokenAmounts
      }
    `,
  )

  return gql`
    query GetMarketHistory($id: ID!) {
    ${subqueries.join(',')}
    }
  `
}

type HistoricDataPoint = {
  block: Block
  holdings: string[]
}

type HistoricData = HistoricDataPoint[]

const useHoldingsHistory = (marketMakerAddress: string, blocks: Maybe<Block[]>): Maybe<HistoricData> => {
  // we need a valid query even if it will be skipped, so we use a syntactic valid placeholder
  // when blockNumbers is null
  const query = blocks
    ? buildQueryHistory(blocks.map(block => block.number))
    : gql`
        query NullQuery($id: ID!) {
          fixedProductMarketMaker(id: $id) {
            id
          }
        }
      `

  const queryResult = useQuery<{ [key: string]: { outcomeTokenAmounts: string[] } }>(query, {
    notifyOnNetworkStatusChange: true,
    skip: blocks === null,
    variables: { id: marketMakerAddress },
  })

  if (queryResult.data && blocks) {
    const result: HistoricData = []
    Object.values(queryResult.data).forEach((value, index) => {
      if (value) {
        const block = blocks[index]
        const holdings = value.outcomeTokenAmounts
        result.push({ block, holdings })
      }
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
}

const blocksPerDay = 5760
const blocksPerHour = Math.floor(blocksPerDay / 24)
const blocksPerMinute = Math.floor(blocksPerHour / 60)

const mapPeriod: { [period in Period]: { totalDataPoints: number; blocksPerPeriod: number } } = {
  '1D': { totalDataPoints: 24, blocksPerPeriod: blocksPerHour },
  '1W': { totalDataPoints: 7, blocksPerPeriod: blocksPerDay },
  '1M': { totalDataPoints: 30, blocksPerPeriod: blocksPerDay },
}

const calcOffsetByDate = (nowOrClosedTs: number) => {
  const now = moment()
  const offsetInMinutes = moment(nowOrClosedTs)
    .startOf('day')
    .diff(now, 'minute')

  return -offsetInMinutes * blocksPerMinute
}

export const HistoryChartContainer: React.FC<Props> = ({
  answerFinalizedTimestamp,
  hidden,
  marketMakerAddress,
  outcomes,
}) => {
  const { library } = useWeb3Context()
  const [latestBlockNumber, setLatestBlockNumber] = useState<Maybe<number>>(null)
  const [blocks, setBlocks] = useState<Maybe<Block[]>>(null)
  const holdingsSeries = useHoldingsHistory(marketMakerAddress, blocks)
  const [period, setPeriod] = useState<Period>('1W')
  const blocksOffset = useMemo(
    () => calcOffsetByDate(answerFinalizedTimestamp ? answerFinalizedTimestamp.toNumber() * 1000 : Date.now()),
    [answerFinalizedTimestamp],
  )

  useEffect(() => {
    library.getBlockNumber().then((latest: number) => setLatestBlockNumber(latest - blocksOffset))
  }, [blocksOffset, library])

  useEffect(() => {
    const getBlocks = async (latestBlockNumber: number) => {
      const { blocksPerPeriod, totalDataPoints } = mapPeriod[period]

      if (latestBlockNumber) {
        const blockNumbers = range(totalDataPoints).map(multiplier => latestBlockNumber - multiplier * blocksPerPeriod)
        const blocks = await Promise.all(blockNumbers.map(blockNumber => library.getBlock(blockNumber)))

        setBlocks(blocks)
      }
    }

    if (latestBlockNumber) {
      getBlocks(latestBlockNumber)
    }
  }, [latestBlockNumber, library, period])
  return hidden ? null : (
    <HistoryChart
      holdingSeries={holdingsSeries}
      onChange={setPeriod}
      options={keys(mapPeriod)}
      outcomes={outcomes}
      value={period}
    />
  )
}
