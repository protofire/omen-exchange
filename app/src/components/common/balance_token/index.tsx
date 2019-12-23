import React, { useMemo } from 'react'
import styled from 'styled-components'

import { ButtonLink } from '../button_link'
import { BigNumber } from 'ethers/utils'
import { useAsyncDerivedValue } from '../../../hooks/useAsyncDerivedValue'
import { formatBigNumber } from '../../../util/tools'
import { ERC20Service } from '../../../services'
import { useConnectedWeb3Context } from '../../../hooks/connectedWeb3'
import { Token } from '../../../util/types'

interface Props {
  collateral: Token
  onClickMax: (collateral: Token, collateralBalance: BigNumber) => void
}

const Wrapper = styled.span`
  display: flex;
  flex-direction: row;
  width: 100%;
  padding-bottom: 5px;
`

const BalanceTitle = styled.span`
  margin-right: 10px;
  margin-top: 3px;
`

export const BalanceToken = (props: Props) => {
  const context = useConnectedWeb3Context()

  const { account, library: provider, rawWeb3Context } = context
  const { collateral, onClickMax } = props

  const calculateBalanceAmount = useMemo(
    () => async (): Promise<[BigNumber, string, string]> => {
      const collateralService = new ERC20Service(
        provider,
        rawWeb3Context.connectorName,
        collateral.address,
      )

      // TODO: fix with useConnectedWallet context
      const collateralBalance = await collateralService.getCollateral(account || '')
      return [
        collateralBalance,
        formatBigNumber(collateralBalance, collateral.decimals),
        collateral.symbol,
      ]
    },
    [account, provider, rawWeb3Context, collateral],
  )

  const [collateralBalance, calculateBalanceAmountValue, collateralSymbol] = useAsyncDerivedValue(
    '',
    [new BigNumber(0), '', ''],
    calculateBalanceAmount,
  )

  return (
    <Wrapper>
      <BalanceTitle>
        Balance {calculateBalanceAmountValue} {collateralSymbol}.
      </BalanceTitle>
      <ButtonLink onClick={() => onClickMax(collateral, collateralBalance)}>Max</ButtonLink>
    </Wrapper>
  )
}
