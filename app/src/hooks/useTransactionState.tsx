import { useState } from 'react'

import { TransactionStep } from '../util/types'

export const useTransactionState = () => {
  const [txState, setTxState] = useState<TransactionStep>(TransactionStep.idle)
  const [txHash, setTxHash] = useState('')

  return { txHash, txState, setTxHash, setTxState }
}
