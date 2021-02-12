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
}

const MainWrapper = styled.div`
  text-align: center;
  user-select: text;
`

const SvgWrapper = styled.div`
  margin-bottom: 25px;
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
  margin-top: 20px;
`

const ChainText = styled.div`
  margin-top: 8px;
  margin-bottom: 16px;
`
const TransactionText = styled.div`
  color: ${({ theme }) => theme.colors.textColor};
`
const TransactionLink = styled.a`
  color: ${({ theme }) => theme.colors.clickable};
`
export const TransactionState = ({
  amountToTransfer,
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
        Transfer {formatBigNumber(amountToTransfer, 18)} {network === 1 ? 'DAI' : 'XDAI'}
      </BoldedText>
      <ChainText>to {network === 1 ? 'xDai Chain' : 'Mainnet'}</ChainText>

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
