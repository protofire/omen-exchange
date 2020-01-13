import React, { useMemo } from 'react'
import styled from 'styled-components'

import { BigNumber } from 'ethers/utils'
import { useAsyncDerivedValue } from '../../../hooks/useAsyncDerivedValue'
import { formatBigNumber } from '../../../util/tools'
import { ERC20Service } from '../../../services'
import { useConnectedWeb3Context } from '../../../hooks/connectedWeb3'
import { Token } from '../../../util/types'
import { FormRowNote } from '../form_row_note'
import { FormRowLink } from '../form_row_link'

interface Props {
  collateral: Token
  onClickMax: (collateral: Token, collateralBalance: BigNumber) => void
}

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin: 0 0 5px 0;

  &:last-child {
    margin-bottom: 0;
  }
`

const Note = styled(FormRowNote)`
  margin: 0 15px 0 0;
`

export const BalanceToken = (props: Props) => {
  const context = useConnectedWeb3Context()

  const { account, library: provider } = context
  const { collateral, onClickMax } = props

  const calculateBalanceAmount = useMemo(
    () => async (): Promise<[BigNumber, string, string]> => {
      const collateralService = new ERC20Service(provider, account, collateral.address)

      // TODO: fix with useConnectedWallet context
      const collateralBalance = account
        ? await collateralService.getCollateral(account)
        : new BigNumber(0)
      return [
        collateralBalance,
        formatBigNumber(collateralBalance, collateral.decimals),
        collateral.symbol,
      ]
    },
    [account, provider, collateral],
  )

  const [collateralBalance, calculateBalanceAmountValue, collateralSymbol] = useAsyncDerivedValue(
    '',
    [new BigNumber(0), '', ''],
    calculateBalanceAmount,
  )

  return (
    <Wrapper>
      <Note>
        Current Balance{' '}
        <strong>
          {calculateBalanceAmountValue} {collateralSymbol}
        </strong>
      </Note>
      <FormRowLink onClick={() => onClickMax(collateral, collateralBalance)}>
        Add all funds
      </FormRowLink>
    </Wrapper>
  )
}
