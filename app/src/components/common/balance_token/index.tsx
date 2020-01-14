import React from 'react'
import styled from 'styled-components'

import { BigNumber } from 'ethers/utils'
import { Token } from '../../../util/types'
import { FormRowNote } from '../form_row_note'
import { FormRowLink } from '../form_row_link'
import { formatBigNumber } from '../../../util/tools'

interface Props {
  collateral: Token
  collateralBalance: BigNumber
  onClickAddMaxCollateral: () => any
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
  const { collateral, collateralBalance, onClickAddMaxCollateral } = props

  return (
    <Wrapper>
      <Note>
        Current Balance{' '}
        <strong>
          {formatBigNumber(collateralBalance, collateral.decimals)} {collateral.symbol}
        </strong>
      </Note>
      <FormRowLink onClick={onClickAddMaxCollateral}>Add all funds</FormRowLink>
    </Wrapper>
  )
}
