import React, { useMemo } from 'react'

import { getToken } from '../../../util/addresses'
import { ButtonLink } from '../button_link'
import { BigNumber } from 'ethers/utils'
import { useAsyncDerivedValue } from '../../../hooks/useAsyncDerivedValue'
import { formatBigNumber } from '../../../util/tools'
import { ERC20Service } from '../../../services'
import { useConnectedWeb3Context } from '../../../hooks/connectedWeb3'
import { Token } from '../../../util/types'

interface Props {
  collateralId: KnownToken
  onClickMax: (collateral: Token, collateralBalance: BigNumber) => void
}

export const BalanceToken = (props: Props) => {
  const context = useConnectedWeb3Context()

  const { networkId, account, library } = context
  const { collateralId, onClickMax } = props

  const collateral = getToken(networkId, collateralId)

  const calculateBalanceAmount = useMemo(
    () => async (): Promise<BigNumber> => {
      const collateralService = new ERC20Service(collateral.address)

      return collateralService.getCollateral(account, library)
    },
    [account, library, collateral],
  )

  const collateralBalance = useAsyncDerivedValue(
    new BigNumber(0),
    new BigNumber(0),
    calculateBalanceAmount,
  )

  const collateralBalanceFormatted = formatBigNumber(collateralBalance, collateral.decimals)

  return (
    <>
      Balance {collateralBalanceFormatted} {collateral.symbol}{' '}
      <ButtonLink onClick={() => onClickMax(collateral, collateralBalance)}>Max</ButtonLink>
    </>
  )
}
