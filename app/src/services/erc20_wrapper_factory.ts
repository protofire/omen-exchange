import { Contract, utils } from 'ethers'
import { BigNumber } from 'ethers/utils'

const WRAPPER_FACTORY_INTERFACE = new utils.Interface([
  `function createWrapper(string _name, string _symbol, uint256 _positionId) external`,
])

class ERC20WrapperFactoryService {
  public readonly contract: Contract

  constructor(address: string, provider: any) {
    this.contract = new Contract(address, WRAPPER_FACTORY_INTERFACE, provider)
  }

  get address(): string {
    return this.contract.address
  }

  static encodeCreateWrapperCall = (name: string, symbol: string, positionId: BigNumber): string => {
    return WRAPPER_FACTORY_INTERFACE.functions.createWrapper.encode([name, symbol, positionId])
  }
}

export { ERC20WrapperFactoryService }
