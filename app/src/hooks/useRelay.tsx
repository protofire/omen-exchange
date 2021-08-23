import { BigNumber } from 'ethers/utils'
import { useEffect, useState } from 'react'

import { useConnectedWeb3Context } from '../contexts/connectedWeb3'
import { RelayService } from '../services'
import { getNativeAsset } from '../util/networks'
import { Token } from '../util/types'

interface Status {
  active: boolean
}

interface RelayServiceResponse {
  relayAddress: string
  relayFee: BigNumber
  relayFeeGreaterThanAmount: boolean
  relayFeeGreaterThanBalance: boolean
}

export const useRelay = (amount: BigNumber, collateral: Token): RelayServiceResponse => {
  const { account, balances, networkId, relay } = useConnectedWeb3Context()

  const [relayAddress, setRelayAddress] = useState('')
  const [relayFee, setRelayFee] = useState(new BigNumber('0'))
  const [relayFeeGreaterThanAmount, setRelayFeeGreaterThanAmount] = useState(false)
  const [relayFeeGreaterThanBalance, setRelayFeeGreaterThanBalance] = useState(false)

  const fetchRelayInfo = async (status?: Status) => {
    const relayService = new RelayService()
    const { address, fee } = await relayService.getInfo()
    if (!status || status.active) {
      setRelayAddress(address)

      const feeBN = new BigNumber(fee)
      setRelayFee(feeBN)
      setRelayFeeGreaterThanBalance(feeBN.gt(balances.xDaiBalance))
    }
  }

  useEffect(() => {
    const status = { active: true }
    if (account && relay) {
      fetchRelayInfo(status)
    } else {
      setRelayAddress('')
      setRelayFee(new BigNumber('0'))
      setRelayFeeGreaterThanBalance(false)
    }
    return () => {
      status.active = false
    }
    // eslint-disable-next-line
  }, [account, networkId, relay])

  useEffect(() => {
    if (account && relay) {
      const native = getNativeAsset(networkId, relay)
      const feeGreaterThanAmount =
        relay && amount && !amount.isZero() && relayFee.gt(amount) && collateral.address === native.address
      setRelayFeeGreaterThanAmount(feeGreaterThanAmount)
    } else {
      setRelayFeeGreaterThanAmount(false)
    }
  }, [amount, collateral, account, relay, networkId, relayFee])

  return { relayAddress, relayFee, relayFeeGreaterThanAmount, relayFeeGreaterThanBalance }
}
