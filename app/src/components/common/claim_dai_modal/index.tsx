import React, { useEffect } from 'react'
import styled from 'styled-components'

import { State, useXdaiBridge } from '../../../hooks/useXdaiBridge'
import { formatBigNumber } from '../../../util/tools'
import { Button } from '../../button/button'
import { ButtonRound } from '../../button/button_round'
import { ButtonType } from '../../button/button_styling_types'
import { IconClose } from '../icons'
import { IconArrowUp } from '../icons/IconArrowUp'
import { IconChevronUp } from '../icons/IconChevronUp'
import { DaiIcon } from '../icons/currencies'
import { Spinner } from '../spinner'
import { Modal, ModalBackground } from '../switch_network_modal'

const ClaimAmount = styled.div`
  margin-top: 32px;
  font-size: 16px;
  color: ${props => props.theme.textfield.color};
`
const SecondaryText = styled.div`
  margin-top: 12px;
  color: ${props => props.theme.colors.textColor};
  font-size: ${props => props.theme.fonts.defaultSize};
  text-align: center;
`
const ClaimButton = styled(Button)`
  margin-top: 32px;
`
const CloseStyled = styled.div`
  align-self: flex-end;
  cursor: pointer;
  margin-bottom: 32px;
`
const CloseButton = styled(ButtonRound)`
  width: 252px;
  margin-top: 32px;
`
const TransactionLink = styled.a`
  margin-top: 16px;
  color: ${({ theme }) => theme.colors.clickable};
`
const Reversed = styled.div`
  transform: rotate(180deg);
`

export const ClaimDaiModal = (props: any) => {
  const { claimLatestToken, transactionHash, transactionStep } = useXdaiBridge()
  //to to test state just uncomment code below here and uncomment mikana in the claim button below as well as remove transactin Step for xDai bridge
  // let mikana = 10
  // const transactionStep =
  //   mikana === 1
  //     ? State.transactionSubmitted
  //     : mikana === 2
  //     ? State.transactionConfirmed
  //     : mikana === 3
  //     ? State.waitingConfirmation
  //     : mikana === 4
  //     ? State.error
  //     : State.idle
  // console.log(transactionStep)
  useEffect(() => {
    if (transactionStep === State.error) props.setClaim(false)
  }, [transactionStep])

  return (
    <ModalBackground>
      <Modal style={{ padding: '24px 32px' }}>
        <CloseStyled
          onClick={() => {
            props.setClaim(false)
          }}
        >
          <IconClose color={'#DCDFF2'} size={'24'} />
        </CloseStyled>

        {transactionStep === State.idle && <DaiIcon size={'64'} />}
        {transactionStep === State.waitingConfirmation && <Spinner size={'64'} />}
        {transactionStep === State.transactionSubmitted && (
          <Reversed>
            <IconArrowUp size={'64'} />
          </Reversed>
        )}
        {transactionStep === State.transactionConfirmed && (
          <Reversed>
            <IconArrowUp color={'#4B9E98'} size={'64'} />
          </Reversed>
        )}

        <ClaimAmount>Claim {formatBigNumber(props.unclaimedAmount, 18, 2)} DAI</ClaimAmount>
        {transactionStep === State.idle && (
          <SecondaryText>
            Withdrawals from xDai Network <br /> need to be claimed
          </SecondaryText>
        )}
        {transactionStep === State.waitingConfirmation ? (
          <SecondaryText>Waiting Confirmation</SecondaryText>
        ) : transactionStep === State.transactionSubmitted || transactionStep === State.transactionConfirmed ? (
          <TransactionLink
            href={`https://etherscan.io/tx/${transactionHash}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            {transactionStep === State.transactionSubmitted ? 'Transaction submitted' : 'Transaction Confirmed'}
          </TransactionLink>
        ) : (
          ''
        )}
        {transactionStep === State.idle ? (
          <ClaimButton
            buttonType={ButtonType.primary}
            onClick={() => {
              claimLatestToken()
              // mikana++
            }}
            style={{ width: '252px' }}
          >
            Claim DAI
          </ClaimButton>
        ) : (
          <CloseButton>Close</CloseButton>
        )}
      </Modal>
    </ModalBackground>
  )
}
