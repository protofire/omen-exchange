import { BigNumber } from 'ethers/utils'
import React, { useEffect, useState } from 'react'

import { ConnectedWeb3Context } from '../../../hooks/connectedWeb3'
import { CPKService, ERC20Service } from '../../../services'
import { Token } from '../../../util/types'
import { Button } from '../button'
import { Loading } from '../loading'

interface Props {
  collateral: Token
  amount: BigNumber
  context: ConnectedWeb3Context
}

enum CollateralStatus {
  Lock = 'Lock',
  Unlock = 'Unlock',
}

export const ToggleTokenLock = (props: Props) => {
  const { amount, collateral, context } = props
  const { account, library: provider } = context
  const [status, setStatus] = useState(CollateralStatus.Lock)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!account) {
      return
    }

    const fetchAllowance = async () => {
      const cpk = await CPKService.create(provider)
      const collateralService = new ERC20Service(provider, account, collateral.address)
      const hasEnoughAlowance = await collateralService.hasEnoughAllowance(account, cpk.address, amount)
      setStatus(hasEnoughAlowance ? CollateralStatus.Unlock : CollateralStatus.Lock)
    }

    fetchAllowance()
  }, [provider, account, collateral, amount])

  const toggle = async () => {
    const collateralService = new ERC20Service(provider, account, collateral.address)
    const cpk = await CPKService.create(provider)

    setLoading(true)
    if (status === CollateralStatus.Lock) {
      await collateralService.approveUnlimited(cpk.address)
      setStatus(CollateralStatus.Unlock)
    } else {
      await collateralService.approve(cpk.address, new BigNumber(0))
      setStatus(CollateralStatus.Lock)
    }
    setLoading(false)
  }

  const textButton = status === CollateralStatus.Lock ? `Unlock ${collateral.symbol}` : `Lock ${collateral.symbol}`

  return (
    <>
      {!amount.isZero() && <Button onClick={toggle}>{textButton}</Button>}
      {loading && <Loading full={true} />}
    </>
  )
}
