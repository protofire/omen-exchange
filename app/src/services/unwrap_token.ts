import { utils } from 'ethers'
import { BigNumber } from 'ethers/utils'

import wrappedAsset from '../abi/wrappedAsset.json'

class UnwrapTokenService {
  static withdrawAmount = (symbol: string, amount: BigNumber): string => {
    const withdrawInterface = new utils.Interface(wrappedAsset)
    return withdrawInterface.functions.withdraw.encode([amount.toString()])
  }
}

export { UnwrapTokenService }
