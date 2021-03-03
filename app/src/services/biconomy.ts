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

class BiconomyService {
  gasLimit = '3000000'

  request = async (payload: any) => {
    const BICONOMY_API_KEY = 'MPEEl225y.19edc8a0-06f9-444b-b6bc-c1b7ca6bdc31'
    // const url = 'https://api.biconomy.io/api/v2/meta-tx/native'
    const url = 'http://localhost:8000/'
    const response = await axios(url, {
      method: 'POST',
      headers: {
        // 'x-api-key': BICONOMY_API_KEY,
        'Content-Type': 'application/json;charset=utf-8',
      },
      data: JSON.stringify(payload),
    })
    if (response.status !== 200) {
      throw new Error(response.data.message)
    } else {
      const { txHash } = response.data
      return { hash: txHash }
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
    const METHOD_API_ID = '6aa2f830-cc0b-4b4c-a183-e96a046a9800'
    return this.request({
      to: proxyFactoryAddress,
      gasLimit: this.gasLimit,
      apiId: METHOD_API_ID,
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
      from,
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
    const METHOD_API_ID = 'cfcd8ae2-776b-4bcb-87f6-2bf33930dd4a'
    return this.request({
      to: proxyFactoryAddress,
      gasLimit: this.gasLimit,
      apiId: METHOD_API_ID,
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

export { BiconomyService }
