import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import { useEffect, useState } from 'react'

import {
  DAI_TO_XDAI_TOKEN_BRIDGE_ADDRESS,
  DEFAULT_TOKEN_ADDRESS,
  XDAI_TO_DAI_TOKEN_BRIDGE_ADDRESS,
} from '../common/constants'
import { ERC20Service } from '../services'
import { formatBigNumber } from '../util/tools'

import { useConnectedCPKContext } from './connectedCpk'
import { useConnectedWeb3Context } from './connectedWeb3'

export enum State {
  idle,
  waitingConfirmation,
  transactionSubmitted,
  transactionConfirmed,
  error,
}

export const useXdaiBridge = (amount: BigNumber) => {
  const [state, setState] = useState<State>(State.idle)
  const { account, library: provider, networkId } = useConnectedWeb3Context()
  const [xDaiBalance, setXdaiBalance] = useState<BigNumber>(Zero)
  const [daiBalance, setDaiBalance] = useState<BigNumber>(Zero)
  const bridgeAddress = networkId === 1 ? DAI_TO_XDAI_TOKEN_BRIDGE_ADDRESS : XDAI_TO_DAI_TOKEN_BRIDGE_ADDRESS
  const cpk = useConnectedCPKContext()

  console.log(bridgeAddress, formatBigNumber(amount, 18))

  const transferFunction = async () => {
    try {
      setState(State.waitingConfirmation)
      const transaction = await cpk?.sendDaiToBridge(amount)
      console.log('between waiting')
      setState(State.transactionSubmitted)
      const waitingConfirmation = await cpk?.waitForTransaction(transaction)
      console.log('between confirmed', waitingConfirmation)
      setState(State.transactionConfirmed)
    } catch (err) {
      setState(State.error)
    }
  }

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        if (networkId === 1) {
          const collateralService = new ERC20Service(provider, account, DEFAULT_TOKEN_ADDRESS)
          setDaiBalance(await collateralService.getCollateral(account || ''))
          //figure out json rpc methods for fetching xDai balance
          setXdaiBalance(new BigNumber(32))
        } else {
          const balance = await provider.getBalance(account || '')
          setXdaiBalance(balance)
          //figure out json rpc methods for fetching Dai balance
          setDaiBalance(Zero)
        }
      } catch (error) {
        setXdaiBalance(Zero)
        setDaiBalance(Zero)
      }
    }
    setDaiBalance(Zero)
    setXdaiBalance(Zero)
    fetchBalance()
  }, [account, provider, networkId])

  return {
    transferFunction,
    state,
    daiBalance,
    xDaiBalance,
  }
}
