import axios from 'axios'
import { Zero } from 'ethers/constants'
import { BigNumber, bigNumberify } from 'ethers/utils'
import { useEffect, useState } from 'react'

import { DEFAULT_TOKEN_ADDRESS, INFURA_PROJECT_ID } from '../common/constants'
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
  const [transactionHash, setTransactionHash] = useState<string>('')
  const cpk = useConnectedCPKContext()

  const transferFunction = async () => {
    try {
      if (networkId === 1) {
        setState(State.waitingConfirmation)

        const transaction = await cpk?.sendDaiToBridge(amount)

        setTransactionHash(transaction.hash)
        setState(State.transactionSubmitted)

        await cpk?.waitForTransaction(transaction)
        setState(State.transactionConfirmed)
      } else {
        const amountInFloat = formatBigNumber(amount, 18)

        if (parseInt(amountInFloat) < 10) {
          setState(State.error)
          return
        }
        setState(State.waitingConfirmation)

        const transaction = await cpk?.sendXdaiToBridge(amount)

        setTransactionHash(transaction)
        setState(State.transactionSubmitted)

        await cpk?.waitForTransaction({ hash: transaction })
        setState(State.transactionConfirmed)
      }
      fetchBalance()
    } catch (err) {
      setState(State.error)
    }
  }

  const requestCrossChainBalance = async (userAddress: string, chain: string) => {
    try {
      const response = await axios.post(
        chain === 'xDai' ? 'https://dai.poa.network/' : `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
        {
          jsonrpc: '2.0',
          id: +new Date(),
          method: chain === 'xDai' ? 'eth_getBalance' : 'eth_call',
          params: [
            chain === 'xDai'
              ? userAddress
              : {
                  data: ERC20Service.encodedBalanceOf(userAddress),
                  to: DEFAULT_TOKEN_ADDRESS,
                },
            'latest',
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
      return response.data.result
    } catch (e) {
      throw new Error(`Error while fetching cross chain balance ${e}`)
    }
  }

  const fetchBalance = async () => {
    try {
      const userAddress = await provider.getSigner().getAddress()
      console.log(networkId)

      console.log('mainnet')
      const responseXdai = await requestCrossChainBalance(userAddress, 'xDai')
      //below are functions for fetching balance for Dai
      // const collateralService = new ERC20Service(provider, account, DEFAULT_TOKEN_ADDRESS)
      // setDaiBalance(await collateralService.getCollateral(account || ''))
      setXdaiBalance(bigNumberify(responseXdai))
      console.log(formatBigNumber(bigNumberify(responseXdai), 18))

      console.log('xDai here')

      const responseDai = await requestCrossChainBalance(userAddress, 'mainnet')
      //method for fetching balance for xDai
      // const balance = await provider.getBalance(account || '')
      // setXdaiBalance(balance)
      console.log(formatBigNumber(bigNumberify(responseDai), 18))
      setDaiBalance(bigNumberify(responseDai))
    } catch (error) {
      throw new Error(`Error while fetching balance ${error}`)
    }
  }

  useEffect(() => {
    fetchBalance()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkId, account])

  return {
    transferFunction,
    transactionHash,
    state,
    daiBalance,
    xDaiBalance,
  }
}
