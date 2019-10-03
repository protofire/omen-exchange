import { ethers, Wallet } from 'ethers'
import { BigNumber } from 'ethers/utils'

import { getLogger } from '../util/logger'

const logger = getLogger('Services::Erc20')

const erc20Abi = [
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
]

class ERC20Service {
  tokenAddress: string

  constructor(tokenAddress: string) {
    this.tokenAddress = tokenAddress
  }

  /**
   * @returns A boolean indicating if `spender` has enough allowance to transfer `neededAmount` tokens from `spender`.
   */
  hasEnoughAllowance = async (
    provider: any,
    owner: string,
    spender: string,
    neededAmount: BigNumber,
  ): Promise<boolean> => {
    const erc20Contract = new ethers.Contract(this.tokenAddress, erc20Abi, provider)

    const allowance: BigNumber = await erc20Contract.allowance(owner, spender)

    return allowance.gte(neededAmount)
  }

  /**
   * Approve `spender` to transfer `amount` tokens on behalf of the connected user.
   */
  approve = async (provider: any, spender: string, amount: BigNumber): Promise<any> => {
    const signer: Wallet = provider.getSigner()

    const erc20Contract = new ethers.Contract(this.tokenAddress, erc20Abi, provider).connect(signer)

    const transactionObject = await erc20Contract.approve(spender, amount)
    logger.log(`Approve transaccion hash: ${transactionObject.hash}`)
  }

  /**
   * Approve `spender` to transfer an "unlimited" amount of tokens on behalf of the connected user.
   */
  approveUnlimited = async (provider: any, spender: string): Promise<any> => {
    const signer: Wallet = provider.getSigner()

    const erc20Contract = new ethers.Contract(this.tokenAddress, erc20Abi, provider).connect(signer)

    const transactionObject = await erc20Contract.approve(spender, ethers.constants.MaxUint256)
    logger.log(`Approve unlimited transaccion hash: ${transactionObject.hash}`)
  }

  getCollateral = async (provider: any, marketMakerAddress: string): Promise<any> => {
    const signer: Wallet = provider.getSigner()

    const erc20Contract = new ethers.Contract(this.tokenAddress, erc20Abi, provider).connect(signer)

    return await erc20Contract.balanceOf(marketMakerAddress)
  }
}

export { ERC20Service }
