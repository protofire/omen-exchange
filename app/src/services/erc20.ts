import { Contract, ethers, utils, Wallet } from 'ethers'
import { BigNumber } from 'ethers/utils'

import { getLogger } from '../util/logger'
import { isAddress, isContract } from '../util/tools'
import { Token } from '../util/types'

const logger = getLogger('Services::Erc20')

const erc20Abi = [
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function balanceOf(address marketMaker) external view returns (uint256)',
  'function symbol() external view returns (string)',
  'function name() external view returns (string)',
  'function decimals() external view returns (uint8)',
]

class ERC20Service {
  tokenAddress: string
  provider: any
  contract: Contract

  constructor(provider: any, signerAddress: Maybe<string>, tokenAddress: string) {
    this.tokenAddress = tokenAddress
    this.provider = provider
    if (signerAddress) {
      const signer: Wallet = provider.getSigner()
      this.contract = new ethers.Contract(tokenAddress, erc20Abi, provider).connect(signer)
    } else {
      this.contract = new ethers.Contract(tokenAddress, erc20Abi, provider)
    }
  }

  /**
   * @returns A boolean indicating if `spender` has enough allowance to transfer `neededAmount` tokens from `spender`.
   */
  hasEnoughAllowance = async (
    owner: string,
    spender: string,
    neededAmount: BigNumber,
  ): Promise<boolean> => {
    const allowance: BigNumber = await this.contract.allowance(owner, spender)
    return allowance.gte(neededAmount)
  }

  /**
   * Approve `spender` to transfer `amount` tokens on behalf of the connected user.
   */
  approve = async (spender: string, amount: BigNumber): Promise<any> => {
    const transactionObject = await this.contract.approve(spender, amount, {
      value: '0x0',
    })
    logger.log(`Approve transaccion hash: ${transactionObject.hash}`)
    await this.provider.waitForTransaction(transactionObject.hash)
    return transactionObject
  }

  /**
   * Approve `spender` to transfer an "unlimited" amount of tokens on behalf of the connected user.
   */
  approveUnlimited = async (spender: string): Promise<any> => {
    const transactionObject = await this.contract.approve(spender, ethers.constants.MaxUint256, {
      value: '0x0',
    })
    logger.log(`Approve unlimited transaccion hash: ${transactionObject.hash}`)
    await this.provider.waitForTransaction(transactionObject.hash)
  }

  getCollateral = async (marketMakerAddress: string): Promise<any> => {
    return this.contract.balanceOf(marketMakerAddress)
  }

  hasEnoughBalanceToFund = async (owner: string, amount: BigNumber): Promise<boolean> => {
    const balance: BigNumber = await this.contract.balanceOf(owner)

    return balance.gte(amount)
  }

  isValidErc20 = async (): Promise<boolean> => {
    try {
      if (!isAddress(this.tokenAddress)) {
        throw new Error('Is not a valid erc20 address')
      }

      if (!isContract(this.provider, this.tokenAddress)) {
        throw new Error('Is not a valid contract')
      }

      const [decimals, symbol] = await Promise.all([
        this.contract.decimals(),
        this.contract.symbol(),
      ])

      return !!(decimals && symbol)
    } catch (err) {
      logger.error(err.message)
      return false
    }
  }

  getProfileSummary = async (): Promise<Token> => {
    const [decimals, symbol] = await Promise.all([this.contract.decimals(), this.contract.symbol()])

    return {
      address: this.tokenAddress,
      decimals,
      symbol,
    }
  }

  static encodeTransferFrom = (from: string, to: string, amount: BigNumber): any => {
    const transferFromInterface = new utils.Interface([
      'function transferFrom(address sender, address recipient, uint256 amount) public returns (bool)',
    ])

    return transferFromInterface.functions.transferFrom.encode([from, to, amount])
  }

  static encodeApprove = (spenderAccount: string, amount: BigNumber): any => {
    const approveInterface = new utils.Interface([
      'function approve(address spender, uint256 amount) external returns (bool)',
    ])

    return approveInterface.functions.approve.encode([spenderAccount, amount])
  }

  static encodeApproveUnlimited = (spenderAccount: string): any => {
    const approveInterface = new utils.Interface([
      'function approve(address spender, uint256 amount) external returns (bool)',
    ])

    return approveInterface.functions.approve.encode([spenderAccount, ethers.constants.MaxUint256])
  }
}

export { ERC20Service }
