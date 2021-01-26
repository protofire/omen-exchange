import { BigNumber } from 'ethers/utils'
import React, { useEffect } from 'react'
import styled from 'styled-components'

import { State } from '../../../../hooks/useXdaiBridge'
import { formatBigNumber } from '../../../../util/tools'
import { ButtonRound } from '../../../button/button_round'
import { IconArrowUp } from '../../../common/icons/IconArrowUp'
import { InlineLoading } from '../../../loading/inline_loading'

interface Prop {
  transactionModalVisibility: any
  state: State
  amountToTransfer: BigNumber
  network: number
  transactionHash: string
  isClaimTransaction: boolean
}

const MainWrapper = styled.div``

const SvgWrapper = styled.div`
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
const TransactionText = styled.div`
  color: ${({ theme }) => theme.colors.textColor};
`
const TransactionLink = styled.a`
  color: ${({ theme }) => theme.colors.clickable};
`
export const TransactionState = ({
  amountToTransfer,
  isClaimTransaction,
  network,
  state,
  transactionHash,
  transactionModalVisibility,
}: Prop) => {
  useEffect(() => {
    if (state === State.error) {
      transactionModalVisibility(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])
  return (
    <MainWrapper>
      <SvgWrapper>
        {state === State.waitingConfirmation ? (
          <InlineLoading message="" />
        ) : state === State.transactionSubmitted ? (
          <IconArrowUp />
        ) : (
          <IconArrowUp color={'#4B9E98'} />
        )}
      </SvgWrapper>

      <BoldedText>
        {isClaimTransaction ? 'Claim' : 'Transfer'} {formatBigNumber(amountToTransfer, 18)}{' '}
        {network === 1 ? 'DAI' : 'XDAI'}
      </BoldedText>
      <ChainText>
        {isClaimTransaction ? 'from' : 'to'} {network === 1 ? 'xDai Chain' : 'Mainnet'}
      </ChainText>

      {state === State.waitingConfirmation ? (
        <TransactionText>Waiting confirmation</TransactionText>
      ) : (
        <TransactionLink
          href={
            network === 1
              ? `https://etherscan.io/tx/${transactionHash}`
              : `https://blockscout.com/poa/xdai/tx/${transactionHash}`
          }
          rel="noopener noreferrer"
          target="_blank"
        >
          {state === State.transactionConfirmed ? 'Transaction Confirmed' : 'Transaction submitted'}
        </TransactionLink>
      )}
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
