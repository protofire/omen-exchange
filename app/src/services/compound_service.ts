import { Contract, Wallet, ethers, utils } from 'ethers'
import { BigNumber } from 'ethers/utils'

import { cBATAbi, cDaiAbi, cETHAbi, cUSDCAbi, cUSDTAbi, cWBTCAbi } from './compound_abi'

class CompoundService {
  contract: Contract
  signerAddress: Maybe<string>
  provider: any

  constructor(address: string, symbol: string, provider: any, signerAddress: Maybe<string>) {
    const cTokenABI = CompoundService.getABI(symbol)
    if (signerAddress) {
      const signer: Wallet = provider.getSigner()
      this.contract = new ethers.Contract(address, cTokenABI, provider).connect(signer)
    } else {
      this.contract = new ethers.Contract(address, cTokenABI, provider)
    }
    this.signerAddress = signerAddress
    this.provider = provider
  }

  static encodeMintTokens = (tokenSymbol: string, amountWei: string): string => {
    const tokenABI = CompoundService.getABI(tokenSymbol)
    const mintInterface = new utils.Interface(tokenABI)
    return mintInterface.functions.mint.encode([amountWei])
  }

  static getABI = (symbol: string) => {
    switch (symbol) {
      case 'cDAI':
        return cDaiAbi
      case 'cWBTC':
        return cWBTCAbi
      case 'cETH':
        return cETHAbi
      case 'cBAT':
        return cBATAbi
      case 'cUSDT':
        return cUSDTAbi
      case 'cUSDC':
        return cUSDCAbi
      default:
        return []
    }
  }
}

export { CompoundService }
