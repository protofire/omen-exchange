import { Contract, utils } from 'ethers'
import { BigNumber } from 'ethers/utils'

const WRAPPER_INTERFACE = new utils.Interface([`function withdraw(uint256 _amount) external`])

class ERC20WrapperService {
  public readonly contract: Contract

  constructor(address: string, provider: any) {
    this.contract = new Contract(address, WRAPPER_INTERFACE, provider).connect(provider.getSigner())
  }

  get address(): string {
    return this.contract.address
  }

  static encodeWithdraw = (amount: BigNumber): string => {
    return WRAPPER_INTERFACE.functions.withdraw.encode([amount])
  }
}

export { ERC20WrapperService }
