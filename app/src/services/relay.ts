import axios from 'axios'

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
  request = async (payload: any) => {
    const url = 'https://omen-relay.vercel.app/'
    const response = await axios(url, {
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
