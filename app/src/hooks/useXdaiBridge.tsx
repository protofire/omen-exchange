import { Zero } from 'ethers/constants'
import { BigNumber, bigNumberify } from 'ethers/utils'
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
  const cpk = useConnectedCPKContext()

  const transferFunction = async () => {
    try {
      if (networkId === 1) {
        console.log()
        setState(State.waitingConfirmation)
        const transaction = await cpk?.sendDaiToBridge(amount)
        console.log('between waiting')
        setState(State.transactionSubmitted)
        const waitingConfirmation = await cpk?.waitForTransaction(transaction)
        console.log('between confirmed', waitingConfirmation)
        setState(State.transactionConfirmed)
      } else {
        //since minimum amount to transfer to xDai is 10

        // console.log(formatBigNumber(amount, 18))
        //
        // console.log('Evaluation', amount.lte(tenDai))
        // // if (amount.gte(tenDai)) {
        // //   console.log('here')
        // //   setState(State.error)
        // // }
        setState(State.waitingConfirmation)
        const transaction = await cpk?.sendXdaiToBridge(amount)
        console.log('Transaction hash=', transaction)
        setState(State.transactionSubmitted)
        const waitingConfirmation = await cpk?.waitForTransaction(transaction)
        console.log('Waiting confirmation=', waitingConfirmation)
      }
    } catch (err) {
      setState(State.error)
    }
  }

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        if (networkId === 1) {
          console.log('lets see it it fucks it up ', networkId)
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
        console.log('error caught', error)
        setXdaiBalance(Zero)
        setDaiBalance(Zero)
      }
    }

    fetchBalance()
  }, [networkId])

  return {
    transferFunction,
    state,
    daiBalance,
    xDaiBalance,
  }
}
