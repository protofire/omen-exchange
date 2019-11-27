import React from 'react'
import styled from 'styled-components'

import { ButtonLink } from '../button_link'
import { formatBigNumber } from '../../../util/tools'
import { BalanceItem, Token } from '../../../util/types'

interface Props {
  balanceItem?: BalanceItem
  collateral: Token
  onClickMax: (balanceItem?: BalanceItem) => void
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

export const BalanceShares = (props: Props) => {
  const { balanceItem, collateral, onClickMax } = props
  const sharesBalanceFormatted = balanceItem
    ? formatBigNumber(balanceItem.shares, collateral.decimals)
    : ''

  return (
    <>
      {sharesBalanceFormatted && (
        <Wrapper>
          <BalanceTitle>Balance {sharesBalanceFormatted}.</BalanceTitle>
          <ButtonLink onClick={() => onClickMax(balanceItem)}>Max</ButtonLink>
        </Wrapper>
      )}
    </>
  )
}
