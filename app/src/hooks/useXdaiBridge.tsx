import { Zero } from 'ethers/constants'
import { BigNumber, bigNumberify } from 'ethers/utils'
import { useEffect, useState } from 'react'

import { XdaiService } from '../services'
import { knownTokens, networkIds } from '../util/networks'
import { formatBigNumber, waitForConfirmations } from '../util/tools'

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
  transactionStep: State
  claimLatestToken: any
  unclaimedAmount: BigNumber
  claimState: boolean
  isClaimStateTransaction: boolean
  numberOfConfirmations: any
  fetchBalance: any
}

export const useXdaiBridge = (amount?: BigNumber): Prop => {
  const [transactionStep, setTransactionStep] = useState<State>(State.idle)
  const { account, library: provider, networkId } = useConnectedWeb3Context()
  const [xDaiBalance, setXdaiBalance] = useState<BigNumber>(Zero)
  const [daiBalance, setDaiBalance] = useState<BigNumber>(Zero)
  const [numberOfConfirmations, setNumberOfConfirmations] = useState<any>(0)
  const [isClaimStateTransaction, setIsClaimStateTransaction] = useState<boolean>(false)
  const [unclaimedAmount, setUnclaimedAmount] = useState<BigNumber>(Zero)
  const [claimState, setClaimState] = useState<boolean>(false)
  const [transactionHash, setTransactionHash] = useState<string>('')
  const cpk = useConnectedCPKContext()
  const { decimals } = knownTokens['dai']

  const transferFunction = async () => {
    try {
      if (!cpk || !amount) return
      if (networkId === networkIds.MAINNET) {
        setTransactionStep(State.waitingConfirmation)

        const transaction = await cpk.sendDaiToBridge(amount)

        setTransactionHash(transaction.hash)
        setTransactionStep(State.transactionSubmitted)

        await waitForConfirmations(transaction, cpk, setNumberOfConfirmations, networkId)

        setTransactionStep(State.transactionConfirmed)
        setNumberOfConfirmations(0)
      } else {
        const amountInFloat = formatBigNumber(amount, decimals)

        if (parseInt(amountInFloat) < 10) {
          setTransactionStep(State.error)
          return
        }
        setTransactionStep(State.waitingConfirmation)

        const transaction = await cpk.sendXdaiToBridge(amount)

        setTransactionHash(transaction)
        setTransactionStep(State.transactionSubmitted)

        await waitForConfirmations(transaction, cpk, setNumberOfConfirmations, networkId)
        setNumberOfConfirmations(0)
        setTransactionStep(State.transactionConfirmed)
      }
      await fetchBalance()
    } catch (err) {
      setTransactionStep(State.error)
      console.error(`Error while transferring! ${err}`)
    }
  }
  const claimLatestToken = async () => {
    try {
      if (!cpk) return
      setIsClaimStateTransaction(true)
      setTransactionStep(State.waitingConfirmation)
      const transaction = await cpk.claimDaiTokens()
      setTransactionHash(transaction.hash)
      setTransactionStep(State.transactionSubmitted)
      await waitForConfirmations(transaction, cpk, setNumberOfConfirmations, networkId)
      setTransactionStep(State.transactionConfirmed)
      setIsClaimStateTransaction(false)
      await fetchUnclaimedAssets()
    } catch (e) {
      setIsClaimStateTransaction(false)
      setTransactionStep(State.error)
      console.error(`Error while claiming DAI! ${e}`)
    }
  }

  const fetchBalance = async () => {
    try {
      const xDaiService = new XdaiService(provider)

      const responseXdai = await xDaiService.fetchCrossChainBalance(100)

      setXdaiBalance(bigNumberify(responseXdai))

      const responseDai = await xDaiService.fetchCrossChainBalance(1)

      setDaiBalance(bigNumberify(responseDai))
    } catch (error) {
      console.error(`Error while fetching balance ${error}`)
    }
  }
  const fetchUnclaimedAssets = async () => {
    const xDaiService = new XdaiService(provider)
    const transaction = await xDaiService.fetchXdaiTransactionData()
    if (transaction) {
      setClaimState(true)
      setUnclaimedAmount(transaction.value)
      return
    }

    setClaimState(false)
    setUnclaimedAmount(Zero)
  }

  useEffect(() => {
    fetchBalance()
    if (networkId === networkIds.MAINNET) {
      fetchUnclaimedAssets()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkId, account, provider])

  return {
    claimLatestToken,
    transferFunction,
    fetchUnclaimedAssets,
    isClaimStateTransaction,
    transactionHash,
    unclaimedAmount,
    claimState,
    numberOfConfirmations,
    transactionStep,
    daiBalance,
    xDaiBalance,
    fetchBalance,
  }
}
