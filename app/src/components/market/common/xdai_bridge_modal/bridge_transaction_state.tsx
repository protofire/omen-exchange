import React from 'react'
import styled from 'styled-components'

import { ButtonRound } from '../../../button/button_round'
import { InlineLoading } from '../../../loading/inline_loading'

interface Prop {
  changeTransferState: any
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
export const TransactionState = (props: Prop) => {
  return (
    <MainWrapper>
      <Loader message="" />
      <BoldedText>Transfer 3225 DAI</BoldedText>
      <ChainText>to xDai Chain</ChainText>
      <TransactionLink>Transaction Submitted</TransactionLink>
      <CloseButton
        onClick={() => {
          props.changeTransferState(false)
        }}
      >
        Close
      </CloseButton>
    </MainWrapper>
  )
}
