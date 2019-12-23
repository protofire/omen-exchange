import React from 'react'
import styled from 'styled-components'

import { formatBigNumber } from '../../../util/tools'
import { BalanceItem, Token } from '../../../util/types'
import { FormRowNote } from '../form_row_note'
import { FormRowLink } from '../form_row_link'

interface Props {
  balanceItem?: BalanceItem
  collateral: Token
  onClickMax: (balanceItem?: BalanceItem) => void
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

export const BalanceShares = (props: Props) => {
  const { balanceItem, collateral, onClickMax } = props
  const sharesBalanceFormatted = balanceItem
    ? formatBigNumber(balanceItem.shares, collateral.decimals)
    : ''

  return (
    <>
      {sharesBalanceFormatted && (
        <Wrapper>
          <Note>
            Balance <strong>{sharesBalanceFormatted}</strong>
          </Note>
          <FormRowLink onClick={() => onClickMax(balanceItem)}>Add all funds</FormRowLink>
        </Wrapper>
      )}
    </>
  )
}
