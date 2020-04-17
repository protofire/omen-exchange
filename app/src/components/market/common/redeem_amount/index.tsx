import Big from 'big.js'
import { BigNumber } from 'ethers/utils'
import React, { DOMAttributes } from 'react'
import styled from 'styled-components'

import { formatBigNumber } from '../../../../util/tools'
import { BalanceItem, Token } from '../../../../util/types'

const Wrapper = styled.div<{ outcomeIndex: number }>`
  color: ${props =>
    props.theme.outcomes.colors[props.outcomeIndex].darker
      ? props.theme.outcomes.colors[props.outcomeIndex].darker
      : '#333'};
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  margin: 12px 0 0 0;
  text-align: left;
`

interface Props extends DOMAttributes<HTMLDivElement> {
  balance: BalanceItem
  collateral: Token
  index: number
  payouts: Maybe<number[]>
}

export const RedeemAmount: React.FC<Props> = (props: any) => {
  const { balance, collateral, index, payouts } = props
  const shares = new Big(balance.shares.toString())
  const isWinningOutcome = payouts && payouts[index] > 0

  if (!payouts || shares.eq(0) || !isWinningOutcome) return null

  const redeemable = new BigNumber(shares.mul(payouts[index]).toString())

  return (
    <Wrapper outcomeIndex={index}>{`Redeem ${formatBigNumber(redeemable, collateral.decimals)}
     (${shares} Shares)`}</Wrapper>
  )
}
