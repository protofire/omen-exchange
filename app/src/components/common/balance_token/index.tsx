import React, { useMemo } from 'react'
import styled from 'styled-components'

import { BigNumber } from 'ethers/utils'
import { useAsyncDerivedValue } from '../../../hooks/useAsyncDerivedValue'
import { formatBigNumber } from '../../../util/tools'
import { ERC20Service } from '../../../services'
import { useConnectedWeb3Context } from '../../../hooks/connectedWeb3'
import { Token } from '../../../util/types'
import { FormRowNote } from '../form_row_note'

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

const Link = styled.span`
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  font-size: 10px;
  font-weight: 500;
  line-height: 1.2;
  text-align: right;
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
`

export const BalanceToken = (props: Props) => {
  const context = useConnectedWeb3Context()

  const { account, library } = context
  const { collateral, onClickMax } = props

  const calculateBalanceAmount = useMemo(
    () => async (): Promise<[BigNumber, string, string]> => {
      const collateralService = new ERC20Service(library, collateral.address)

      // TODO: fix with useConnectedWallet context
      const collateralBalance = await collateralService.getCollateral(account || '')
      return [
        collateralBalance,
        formatBigNumber(collateralBalance, collateral.decimals),
        collateral.symbol,
      ]
    },
    [account, library, collateral],
  )

  const [collateralBalance, calculateBalanceAmountValue, collateralSymbol] = useAsyncDerivedValue(
    '',
    [new BigNumber(0), '', ''],
    calculateBalanceAmount,
  )

  return (
    <Wrapper>
      <Note>
        Balance{' '}
        <strong>
          {calculateBalanceAmountValue} {collateralSymbol}
        </strong>
      </Note>
      <Link onClick={() => onClickMax(collateral, collateralBalance)}>Add all funds</Link>
    </Wrapper>
  )
}
