import { Contract, Wallet, ethers, utils } from 'ethers'
import { BigNumber, bigNumberify } from 'ethers/utils'

import { Token } from '../util/types'

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

  calculateSupplyRateAPY = async (): Promise<number> => {
    const supplyRate: number = await this.contract.supplyRatePerBlock()
    const ethMantissa = 1e18
    const blocksPerDay = 4 * 60 * 24
    const daysPerYear = 365
    const supplyApy = (Math.pow((supplyRate / ethMantissa) * blocksPerDay + 1, daysPerYear - 1) - 1) * 100
    return supplyApy
  }

  calculateToCTokenExchangeRate = async (
    userInputToken: Token,
    userInputTokenFunding: BigNumber,
  ): Promise<BigNumber> => {
    const cTokenDecimals = 8 // all cTokens have 8 decimal places
    const underlyingDecimals = userInputToken.decimals
    const exchangeCash = await this.contract.getCash()
    const totalBorrows = await this.contract.totalBorrows()
    const totalReserves = await this.contract.totalReserves()
    const totalSupply = await this.contract.totalSupply()
    const exchangeRate = (exchangeCash + totalBorrows - totalReserves) / totalSupply
    const mantissa = 18 + underlyingDecimals - cTokenDecimals
    let cTokensInUnderlying = exchangeRate / (1 * Math.pow(10, mantissa))
    cTokensInUnderlying = Math.round(cTokensInUnderlying)
    const normalizedCTokenInUnderlying = bigNumberify(cTokensInUnderlying.toString())
    const cTokenTotal = userInputTokenFunding.mul(normalizedCTokenInUnderlying)
    return cTokenTotal
  }

  calculateToTokenExchange = async (userInputToken: Token, userInputTokenFunding: BigNumber): Promise<BigNumber> => {
    return new BigNumber('1')
  }

  static encodeMintTokens = (tokenSymbol: string, amountWei: string): string => {
    const tokenABI = CompoundService.getABI(tokenSymbol)
    const mintInterface = new utils.Interface(tokenABI)
    return mintInterface.functions.mint.encode([amountWei])
  }

  static encodeApproveUnlimited = (tokenSymbol: string, spenderAccount: string): string => {
    const tokenABI = CompoundService.getABI(tokenSymbol)
    const approveInterface = new utils.Interface(tokenABI)
    return approveInterface.functions.approve.encode([spenderAccount, ethers.constants.MaxUint256])
  }

  static getABI = (symbol: string) => {
    const symbolLowerCase = symbol.toLowerCase()
    switch (symbolLowerCase) {
      case 'cdai':
        return cDaiAbi
      case 'cwbtc':
        return cWBTCAbi
      case 'ceth':
        return cETHAbi
      case 'cbat':
        return cBATAbi
      case 'cusdt':
        return cUSDTAbi
      case 'cusdc':
        return cUSDCAbi
      default:
        return []
    }
  }
}

export { CompoundService }
