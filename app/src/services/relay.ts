import axios from 'axios'
import { BigNumber } from 'ethers/utils'

import { MAX_RELAY_FEE } from '../common/constants'
import { Transaction } from '../util/cpk'

interface CreateProxyAndExecParams {
  data: string
  fallbackHandlerAddress: string
  from: string
  masterCopyAddress: string
  operation: string
  predeterminedSaltNonce: string
  proxyFactoryAddress: string
  signature: string
  transactions: Transaction[]
  to: string
  value: string
}

interface ExecTransactionParams {
  data: string
  dataGas: number
  from: string
  gasPrice: number
  gasToken: string
  operation: string
  proxyAddress: string
  proxyFactoryAddress: string
  refundReceiver: string
  safeTxGas: number
  signature: string
  transactions: Transaction[]
  to: string
  value: string
}

class RelayService {
  url = 'https://omen-xdai-relay.vercel.app'

  request = async (payload: any) => {
    const response = await axios(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      data: JSON.stringify(payload),
    })
    if (response.status !== 200) {
      throw new Error(response.data.message)
    } else {
      return response.data
    }
  }

  getInfo = async () => {
    const response = await axios(`${this.url}/info`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
    })
    if (response.status !== 200) {
      throw new Error(response.data.message)
    } else {
      const data = response.data
      // max fee safe guard
      if (new BigNumber(data.fee).gt(MAX_RELAY_FEE)) {
        throw new Error('Relay fee is too high')
      }
      return response.data
    }
  }

  createProxyAndExecTransaction = async ({
    data,
    fallbackHandlerAddress,
    from,
    masterCopyAddress,
    operation,
    predeterminedSaltNonce,
    proxyFactoryAddress,
    signature,
    to,
    transactions,
    value,
  }: CreateProxyAndExecParams) => {
    return this.request({
      method: 'createProxyAndExecTransaction',
      to: proxyFactoryAddress,
      params: [
        masterCopyAddress,
        predeterminedSaltNonce,
        fallbackHandlerAddress,
        to,
        value,
        data,
        operation,
        from,
        signature,
      ],
      transactions,
    })
  }

  execTransaction = async ({
    data,
    dataGas,
    from,
    gasPrice,
    gasToken,
    operation,
    proxyAddress,
    proxyFactoryAddress,
    refundReceiver,
    safeTxGas,
    signature,
    to,
    transactions,
    value,
  }: ExecTransactionParams) => {
    return this.request({
      method: 'execTransaction',
      to: proxyFactoryAddress,
      params: [
        proxyAddress,
        to,
        value,
        data,
        operation,
        safeTxGas,
        dataGas,
        gasPrice,
        gasToken,
        refundReceiver,
        signature,
      ],
      from,
      transactions,
    })
  }
}

export { RelayService }
