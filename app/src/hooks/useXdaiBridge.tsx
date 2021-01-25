import axios from 'axios'
import { Zero } from 'ethers/constants'
import { BigNumber, bigNumberify } from 'ethers/utils'
import { useEffect, useState } from 'react'

import { DEFAULT_TOKEN_ADDRESS, INFURA_PROJECT_ID, XDAI_FOREIGN_BRIDGE, XDAI_HOME_BRIDGE } from '../common/constants'
import { ERC20Service } from '../services'
import { formatBigNumber, signaturesFormated } from '../util/tools'

import { useConnectedCPKContext } from './connectedCpk'
import { useConnectedWeb3Context } from './connectedWeb3'

export enum State {
  idle,
  waitingConfirmation,
  transactionSubmitted,
  transactionConfirmed,
  error,
}
interface Prop {
  transactionHash: string
  transferFunction: any
  fetchUnclaimedAssets: any
  daiBalance: BigNumber
  xDaiBalance: BigNumber
  state: State
}

export const useXdaiBridge = (amount: BigNumber): Prop => {
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
  const fetchUnclaimedAssets = async () => {
    // // console.log(cpk)
    // // const cpks = await cpk
    // // const transaction = await cpks?.fetchUnclaimedTransactions()
    // // console.log(transaction)
    // const queryForeign = `
    //   query GetTransactions($address: String!) {
    //     executions(where:{recipient: $address}) {
    //       transactionHash
    //       value
    //     }
    //   }
    //   `
    // const signer = provider.getSigner()
    // const account = await signer.getAddress()
    // console.log(account)
    //
    // const query = `
    //     query Requests($address: String) {
    //         requests(where:{sender: $address}) {
    //             transactionHash
    //             recipient
    //             value
    //             message{
    //               id
    //               content
    //               signatures
    //             }
    //         }
    //     }`
    // const variables = { address: account }
    //
    // console.log('inside')
    // const xDaiRequests = await axios.post(XDAI_HOME_BRIDGE, { query, variables })
    // const xDaiExecutions = await axios.post(XDAI_FOREIGN_BRIDGE, { query: queryForeign, variables })
    // console.log(xDaiRequests)
    // const requestsArray = xDaiRequests.data.data.requests
    // const executionsArray = xDaiExecutions.data.data.executions
    // // console.log(requestsArray, 'jsjsjsjsjsj')
    // // console.log(executionsArray, 'rela deal')
    // const results = requestsArray.filter(
    //   ({ transactionHash: id1 }: any) => !executionsArray.some(({ transactionHash: id2 }: any) => id2 === id1),
    // )
    // console.log(results)

    const transaction = await cpk?.fetchUnclaimedTransactions()
    // console.log(transaction)
    console.log(signaturesFormated(transaction.message.signatures))

    return transaction
  }

  useEffect(() => {
    fetchBalance()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkId, account])

  return {
    transferFunction,
    fetchUnclaimedAssets,
    transactionHash,
    state,
    daiBalance,
    xDaiBalance,
  }
}
