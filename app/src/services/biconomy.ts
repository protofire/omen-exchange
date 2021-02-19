interface CreateProxyAndExecParams {
  data: string
  from: string
  masterCopyAddress: string
  operation: string
  predeterminedSaltNonce: string
  proxyFactoryAddress: string
  signature: string
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
  refundReceiver: string
  safeTxGas: number
  signature: string
  to: string
  value: string
}

class BiconomyService {
  gasLimit = '3000000'

  request = async (payload: any) => {
    const BICONOMY_API_KEY = 'MPEEl225y.19edc8a0-06f9-444b-b6bc-c1b7ca6bdc31'
    const response = await fetch(`https://api.biconomy.io/api/v2/meta-tx/native`, {
      method: 'POST',
      headers: {
        'x-api-key': BICONOMY_API_KEY,
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(payload),
    })
    // TODO: unpack transaction hash
    const json = await response.json()
    return json
  }

  createProxyAndExecTransaction = async ({
    data,
    from,
    masterCopyAddress,
    operation,
    predeterminedSaltNonce,
    proxyFactoryAddress,
    signature,
    to,
    value,
  }: CreateProxyAndExecParams) => {
    const METHOD_API_ID = 'ed29e00e-f3d1-4a53-8c2c-92b6597182a5'
    return this.request({
      to: proxyFactoryAddress,
      gasLimit: this.gasLimit,
      apiId: METHOD_API_ID,
      params: [masterCopyAddress, predeterminedSaltNonce, to, value, data, operation, from, signature],
      from,
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
    refundReceiver,
    safeTxGas,
    signature,
    to,
    value,
  }: ExecTransactionParams) => {
    const METHOD_API_ID = '78dc94f7-4420-4275-862f-e3ab17c4d38e'
    return this.request({
      to: proxyAddress,
      gasLimit: this.gasLimit,
      apiId: METHOD_API_ID,
      params: [to, value, data, operation, safeTxGas, dataGas, gasPrice, gasToken, refundReceiver, signature],
      from,
    })
  }
}

export { BiconomyService }
