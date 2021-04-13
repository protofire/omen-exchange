import { Contract, utils } from 'ethers'
import { BigNumber, getCreate2Address, solidityKeccak256, solidityPack } from 'ethers/utils'

const INIT_CODE_HASH = '0x5058e67e4d72ed90876a53ce32f1bdd8b0f8a4f56cce190f0f25fa4dbe3e1160'
const WRAPPER_INTERFACE = new utils.Interface([`function withdraw(uint256 _amount) external`])

class ERC20WrapperService {
  public readonly contract: Contract

  constructor(address: string, provider: any) {
    this.contract = new Contract(address, WRAPPER_INTERFACE, provider).connect(provider.getSigner())
  }

  static predictAddress = (factoryAddress: string, positionId: BigNumber): string =>
    getCreate2Address({
      from: factoryAddress,
      initCodeHash: INIT_CODE_HASH,
      salt: solidityKeccak256(['bytes'], [solidityPack(['uint256'], [positionId])]),
    })

  static encodeWithdraw = (amount: BigNumber): string => {
    return WRAPPER_INTERFACE.functions.withdraw.encode([amount])
  }
}

export { ERC20WrapperService }
