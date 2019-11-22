import React from 'react'

import { ButtonLink } from '../button_link'
import { formatBigNumber } from '../../../util/tools'
import { BalanceItem, Token } from '../../../util/types'

interface Props {
  balanceItem?: BalanceItem
  collateral: Token
  onClickMax: (balanceItem?: BalanceItem) => void
}

export const BalanceShares = (props: Props) => {
  const { balanceItem, collateral, onClickMax } = props
  const sharesBalanceFormatted = balanceItem
    ? formatBigNumber(balanceItem.shares, collateral.decimals)
    : ''

  return (
    <>
      {sharesBalanceFormatted && (
        <>
          Balance {sharesBalanceFormatted}{' '}
          <ButtonLink onClick={() => onClickMax(balanceItem)}>Max</ButtonLink>
        </>
      )}
    </>
  )
}
