import { BigNumber } from 'ethers/utils'
import React from 'react'
import styled from 'styled-components'

import { formatBigNumber } from '../../../util/tools'
import { Token } from '../../../util/types'
import { FormRowLink } from '../form_row_link'
import { FormRowNote } from '../form_row_note'

interface Props {
  shares: BigNumber
  collateral: Token
  onClickMax: (shares: BigNumber) => void
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
  const { collateral, onClickMax, shares } = props

  return (
    <Wrapper>
      <Note>
        Current Balance <strong>{formatBigNumber(shares, collateral.decimals)} shares</strong>
      </Note>
      <FormRowLink onClick={() => onClickMax(shares)}>Add all shares</FormRowLink>
    </Wrapper>
  )
}
