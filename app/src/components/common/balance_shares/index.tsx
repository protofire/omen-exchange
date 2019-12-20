import React from 'react'
import styled from 'styled-components'

import { formatBigNumber } from '../../../util/tools'
import { BalanceItem, Token } from '../../../util/types'
import { FormRowNote } from '../form_row_note'

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
          <Link onClick={() => onClickMax(balanceItem)}>Add all funds</Link>
        </Wrapper>
      )}
    </>
  )
}
