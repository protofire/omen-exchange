import { BigNumber } from 'ethers/utils'
import { useState } from 'react'

import { DAI_TO_XDAI_TOKEN_BRIDGE_ADDRESS, XDAI_TO_DAI_TOKEN_BRIDGE_ADDRESS } from '../common/constants'
import { formatBigNumber } from '../util/tools'

export const useXdaiBridge = (network: number, amount: BigNumber) => {
  const [state, setState] = useState(true)
  const bridgeAddress = network === 1 ? DAI_TO_XDAI_TOKEN_BRIDGE_ADDRESS : XDAI_TO_DAI_TOKEN_BRIDGE_ADDRESS
  console.log(bridgeAddress, formatBigNumber(amount, 18))

  const transferFunction = () => {
    console.log('here the transaction will be executed based on chain')
    setState(!state)
  }

  return {
    transferFunction,
    state,
  }
}
