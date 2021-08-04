import { utils } from 'ethers'
import { BigNumber } from 'ethers/utils'

import wrappedAsset from '../abi/wrappedAsset.json'

class UnwrapTokenService {
  static withdrawAmount = (symbol: string, amount: BigNumber): string => {
    const contractABI = UnwrapTokenService.getABI(symbol.toLowerCase())
    const withdrawInterface = new utils.Interface(contractABI)
    return withdrawInterface.functions.withdraw.encode([amount.toString()])
  }

  static getABI = (symbol: string) => {
    const symbolLowerCase = symbol.toLowerCase()
    switch (symbolLowerCase) {
      case 'wxdai':
      case 'wspoa':
      case 'weth':
        return wrappedAsset
      default:
        return []
    }
  }
}

export { UnwrapTokenService }
