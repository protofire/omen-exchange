import { ethers, Wallet } from 'ethers'
import { BigNumber } from 'ethers/utils'

import { getLogger } from '../util/logger'
import { isAddress, isContract } from '../util/tools'
import { Collateral } from '../util/types'

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

  constructor(provider: any, tokenAddress: string) {
    this.tokenAddress = tokenAddress
    this.provider = provider
  }

  /**
   * @returns A boolean indicating if `spender` has enough allowance to transfer `neededAmount` tokens from `spender`.
   */
  hasEnoughAllowance = async (
    owner: string,
    spender: string,
    neededAmount: BigNumber,
  ): Promise<boolean> => {
    const erc20Contract = new ethers.Contract(this.tokenAddress, erc20Abi, this.provider)

    const allowance: BigNumber = await erc20Contract.allowance(owner, spender)

    return allowance.gte(neededAmount)
  }

  /**
   * Approve `spender` to transfer `amount` tokens on behalf of the connected user.
   */
  approve = async (spender: string, amount: BigNumber): Promise<any> => {
    const signer: Wallet = this.provider.getSigner()

    const erc20Contract = new ethers.Contract(this.tokenAddress, erc20Abi, this.provider).connect(
      signer,
    )

    const transactionObject = await erc20Contract.approve(spender, amount, {
      value: '0x0',
    })
    logger.log(`Approve transaccion hash: ${transactionObject.hash}`)
    await this.provider.waitForTransaction(transactionObject.hash)
  }

  /**
   * Approve `spender` to transfer an "unlimited" amount of tokens on behalf of the connected user.
   */
  approveUnlimited = async (spender: string): Promise<any> => {
    const signer: Wallet = this.provider.getSigner()

    const erc20Contract = new ethers.Contract(this.tokenAddress, erc20Abi, this.provider).connect(
      signer,
    )

    const transactionObject = await erc20Contract.approve(spender, ethers.constants.MaxUint256, {
      value: '0x0',
    })
    logger.log(`Approve unlimited transaccion hash: ${transactionObject.hash}`)
    await this.provider.waitForTransaction(transactionObject.hash)
  }

  getCollateral = async (marketMakerAddress: string): Promise<any> => {
    const signer: Wallet = this.provider.getSigner()

    const erc20Contract = new ethers.Contract(this.tokenAddress, erc20Abi, this.provider).connect(
      signer,
    )

    return erc20Contract.balanceOf(marketMakerAddress)
  }

  isValidErc20 = async (): Promise<boolean> => {
    try {
      if (!isAddress(this.tokenAddress)) {
        throw new Error('Is not a valid erc20 address')
      }

      if (!isContract(this.provider, this.tokenAddress)) {
        throw new Error('Is not a valid contract')
      }

      const erc20Contract = new ethers.Contract(this.tokenAddress, erc20Abi, this.provider)

      const [decimals, name, symbol] = await Promise.all([
        erc20Contract.decimals(),
        erc20Contract.name(),
        erc20Contract.symbol(),
      ])

      return !!(decimals && name && symbol)
    } catch (err) {
      logger.error(err.message)
      return false
    }
  }

  getProfileSummary = async (): Promise<Collateral> => {
    const erc20Contract = new ethers.Contract(this.tokenAddress, erc20Abi, this.provider)

    const [decimals, name, symbol] = await Promise.all([
      erc20Contract.decimals(),
      erc20Contract.name(),
      erc20Contract.symbol(),
    ])

    return {
      address: this.tokenAddress,
      decimals,
      name,
      symbol,
    }
  }
}

export { ERC20Service }
