import { utils } from 'ethers'
import { BigNumber } from 'ethers/utils'

import { wETHabi, wsPOAabi, wxDaiabi } from '../abi/wrapped_asset'

class UnwrapTokenService {
  static withdrawAmount = (symbol: string, amount: BigNumber): string => {
    const contractABI = UnwrapTokenService.getABI(symbol)
    const withdrawInterface = new utils.Interface(contractABI)
    return withdrawInterface.functions.withdraw.encode([amount.toString()])
  }

  static getABI = (symbol: string) => {
    const symbolLowerCase = symbol.toLowerCase()
    switch (symbolLowerCase) {
      case 'wxdai':
        return wxDaiabi
      case 'wspoa':
        return wsPOAabi
      case 'weth':
        return wETHabi
      default:
        return []
    }
  }
}

export { UnwrapTokenService }
