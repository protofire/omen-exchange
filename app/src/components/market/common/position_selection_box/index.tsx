import React from 'react'
import styled from 'styled-components'

import { formatBigNumber, formatNumber } from '../../../../util/tools'
import { BalanceItem } from '../../../../util/types'

const PositionSelectionBoxWrapper = styled.div`
  height: 88px;
  border: ${props => props.theme.borders.borderLineDisabled};
  border-radius: ${props => props.theme.cards.borderRadius};
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px 20px;
`

const PositionSelectionBoxItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const PositionSelectionLeft = styled.div`
  display: flex;
  align-items: center;
`

const PositionSelectionRadio = styled.input`
  width: 20px;
  height: 20px;
  border: ${props => props.theme.borders.radioButton};
`

const PositionSelectionTitle = styled.p`
  text-transform: capitalize;
  margin: 0;
  margin-left: 12px;
`

const PositionSelectionAmount = styled.p`
  margin: 0;
`

interface Props {
  balances: BalanceItem[]
  setBalanceItem: React.Dispatch<React.SetStateAction<BalanceItem>>
  setPositionIndex: React.Dispatch<React.SetStateAction<number>>
}

export const PositionSelectionBox = (props: Props) => {
  const { balances, setBalanceItem, setPositionIndex } = props

  console.log(balances)

  const renderPositionSelectionItem = (balance: BalanceItem) => {
    return (
      <PositionSelectionBoxItem>
        <PositionSelectionLeft>
          <PositionSelectionRadio
            name="position"
            onClick={() => {
              setBalanceItem(balance)
              setPositionIndex(balances.indexOf(balance))
            }}
            type="radio"
          />
          <PositionSelectionTitle>{balance.outcomeName}</PositionSelectionTitle>
        </PositionSelectionLeft>
        <PositionSelectionAmount>{formatNumber(formatBigNumber(balance.holdings, 18))} Shares</PositionSelectionAmount>
      </PositionSelectionBoxItem>
    )
  }

  return (
    <PositionSelectionBoxWrapper>
      {balances.map(balance => renderPositionSelectionItem(balance))}
    </PositionSelectionBoxWrapper>
  )
}
