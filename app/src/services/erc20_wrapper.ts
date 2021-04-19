import { Contract, utils } from 'ethers'
import { BigNumber, getCreate2Address, solidityKeccak256, solidityPack } from 'ethers/utils'
import moment from 'moment'

const INIT_CODE_HASH = '0x9d473860035a1e482325c8b924eb5ec7b81c1cc92980847da7016a582acdf82f'
const WRAPPER_INTERFACE = new utils.Interface([`function withdraw(uint256 _amount) external`])

class ERC20WrapperService {
  public readonly address: string
  public readonly contract: Contract
  public readonly positionId: BigNumber

  constructor(address: string, positionId: BigNumber, provider: any) {
    this.contract = new Contract(address, WRAPPER_INTERFACE, provider).connect(provider.getSigner())
    this.positionId = positionId
    this.address = address
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

  static predictName = (question: string, outcomeName: string, resolution: Date): string => {
    return `${question} - ${outcomeName} - ${moment(resolution).format('DD/MM/YYYY HH:mm')}`
  }

  static predictSymbol = (baseERC20TokenSymbol: string, outcomeName: string, resolution: Date): string => {
    return `o${baseERC20TokenSymbol}.${outcomeName.toUpperCase()}.${moment(resolution).format('DD/MM/YYYY/HH:mm')}`
  }
}

export { ERC20WrapperService }
