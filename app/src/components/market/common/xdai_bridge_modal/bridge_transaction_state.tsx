import { BigNumber } from 'ethers/utils'
import React, { useEffect } from 'react'
import styled from 'styled-components'

import { State } from '../../../../hooks/useXdaiBridge'
import { formatBigNumber } from '../../../../util/tools'
import { ButtonRound } from '../../../button/button_round'
import { InlineLoading } from '../../../loading/inline_loading'

interface Prop {
  transactionModalVisibility: any
  state: State
  amountToTransfer: BigNumber
  network: number
}

const MainWrapper = styled.div``

const Loader = styled(InlineLoading)`
  margin-top: 38px;
  margin-bottom: 32px;
`
const BoldedText = styled.div`
  color: ${({ theme }) => theme.colors.textColorDark};
  font-family: Roboto;
  font-weight: 500;
  font-size: 14px;
  line-height: 16px;
`
const CloseButton = styled(ButtonRound)`
  width: 100%;
  margin-top: 33px;
`

const ChainText = styled.div`
  margin: 10px 0;
`
const TransactionLink = styled.a`
  color: ${({ theme }) => theme.colors.clickable};
`
export const TransactionState = ({ amountToTransfer, network, state, transactionModalVisibility }: Prop) => {
  useEffect(() => {
    if (state === State.error) {
      transactionModalVisibility(false)
    }
  }, [state])
  return (
    <MainWrapper>
      <Loader message="" />
      <BoldedText>
        Transfer {formatBigNumber(amountToTransfer, 18)} {network === 1 ? 'DAI' : 'XDAI'}
      </BoldedText>
      <ChainText>to xDai Chain</ChainText>
      <TransactionLink>
        {state === State.transactionSubmitted
          ? 'Transaction Submitted'
          : state === State.transactionConfirmed
          ? 'Transaction confirmed'
          : 'Waiting for confimation'}
      </TransactionLink>
      <CloseButton
        onClick={() => {
          transactionModalVisibility(false)
        }}
      >
        {state === State.transactionConfirmed ? 'Transfer Again' : 'Close'}
      </CloseButton>
    </MainWrapper>
  )
}
