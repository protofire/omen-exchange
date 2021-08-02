import { aggregate } from '@makerdao/multicall'
import configs from '@makerdao/multicall/src/addresses.json'

import { getInfuraUrl, networkNames } from './networks'

export const getCallSig = (contract: any, fn: string) =>
  `${contract.contract.interface.functions[fn].signature}(${contract.contract.interface.functions[fn].outputs.map(
    (output: any) => output.type,
  )})`

export const getMultiCallConfig = (networkId: number) => {
  const network = (networkNames as any)[networkId]
  return {
    rpcUrl: getInfuraUrl(networkId),
    multicallAddress: (configs as any)[network.toLowerCase()].multicall,
  }
}

export const multicall = async (calls: any, networkId: number) => {
  return aggregate(calls, getMultiCallConfig(networkId))
}
