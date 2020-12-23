import { useQuery } from '@apollo/react-hooks'
import { TaskReceiptWrapper } from '@gelatonetwork/core'
import { utils } from 'ethers'
import { useEffect, useState } from 'react'

import { GelatoSubmitted } from '../queries/gelato'
import { Status /*TaskReceiptWrapper*/ } from '../util/types'

import { ConnectedWeb3Context } from './connectedWeb3'
import { useContracts } from './useContracts'

const getEtherscanPrefix = (networkId: number) => {
  switch (networkId) {
    case 1:
      return ''
    case 3:
      return 'ropsten.'
    case 4:
      return 'rinkeby.'
    case 42:
      return 'kovan.'
  }
}

export const useGelatoSubmittedTasks = (
  cpkAddress: string | null,
  marketMakerAddress: string,
  context: ConnectedWeb3Context,
) => {
  const { networkId } = context
  const { gelato } = useContracts(context)

  const [submittedTaskReceiptWrappers, setSubmittedTaskReceiptWrappers] = useState<TaskReceiptWrapper[]>([])
  const [withdrawDate, setWithdrawDate] = useState<Date | null>(null)
  const [etherscanLink, setEtherscanLink] = useState<string | null>(null)

  const { data, error } = useQuery(GelatoSubmitted, {
    notifyOnNetworkStatusChange: true,
    variables: { user: cpkAddress != null ? cpkAddress.toLowerCase() : null },
  })

  const dataLength = data ? data.length : 0

  const getLastTask = (): TaskReceiptWrapper => {
    return submittedTaskReceiptWrappers[submittedTaskReceiptWrappers.length - 1]
  }

  useEffect(() => {
    const storeGelatoDataInState = async () => {
      if (cpkAddress && data) {
        const taskReceiptWrappers = data.taskReceiptWrappers as TaskReceiptWrapper[]
        // For every TaskReceipt
        const wrappers = [] as TaskReceiptWrapper[]
        for (const wrapper of taskReceiptWrappers) {
          const taskData: string = wrapper.taskReceipt.tasks[0].actions[0].data
          const decodedData = await gelato.decodeSubmitTimeBasedWithdrawalTask(taskData)
          const dedcodedMarketMakerAddress = decodedData[1]
          if (utils.getAddress(dedcodedMarketMakerAddress) === utils.getAddress(marketMakerAddress)) {
            wrappers.push(wrapper)
          }
        }

        setSubmittedTaskReceiptWrappers(wrappers)

        // Return the last task receipt
        if (wrappers.length > 0) {
          const lastWrapper = wrappers[wrappers.length - 1]
          const timestamp = await gelato.decodeTimeConditionData(lastWrapper.taskReceipt.tasks[0].conditions[0].data)
          const date = new Date(parseInt(timestamp) * 1000)
          setWithdrawDate(date)

          if (lastWrapper.status === 'execSuccess') {
            const link = `https://${getEtherscanPrefix(networkId)}etherscan.io/tx/${lastWrapper.executionHash}`
            setEtherscanLink(link)
          }
        }
      }
    }
    storeGelatoDataInState()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cpkAddress, submittedTaskReceiptWrappers.length, dataLength, networkId])

  return {
    submittedTaskReceiptWrapper: submittedTaskReceiptWrappers.length > 0 ? getLastTask() : null,
    etherscanLink,
    withdrawDate,
    status: error ? Status.Error : Status.Ready,
  }
}
