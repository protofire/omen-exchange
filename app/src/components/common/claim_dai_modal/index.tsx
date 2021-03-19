import React, { useEffect } from 'react'
import styled from 'styled-components'

import { STANDARD_DECIMALS } from '../../../common/constants'
import { useXdaiBridge } from '../../../hooks/useXdaiBridge'
import theme from '../../../theme'
import { formatBigNumber, getTxHashBlockExplorerURL } from '../../../util/tools'
import { TransactionStep } from '../../../util/types'
import { Button } from '../../button/button'
import { ButtonRound } from '../../button/button_round'
import { ButtonType } from '../../button/button_styling_types'
import { IconClose } from '../icons'
import { IconArrowUp } from '../icons/IconArrowUp'
import { DaiIcon } from '../icons/currencies'
import { Spinner } from '../spinner'
import { Modal, ModalBackground } from '../switch_network_modal'
import { useConnectedWeb3Context } from '../../../hooks'

const ClaimAmount = styled.div`
  margin-top: 32px;
  font-size: 16px;
  line-height: 18.75px;
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
  font-weight: 500;
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
  cursor: pointer;
`
const Reversed = styled.div`
  transform: rotate(180deg);
`

export const ClaimDaiModal = (props: any) => {
  const { claimLatestToken, transactionHash, transactionStep } = useXdaiBridge()
  const context = useConnectedWeb3Context()
  const { networkId } = context

  useEffect(() => {
    if (transactionStep === TransactionStep.error) props.setClaim(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionStep])

  return (
    <ModalBackground>
      <Modal style={{ padding: '24px 32px' }}>
        <CloseStyled
          onClick={() => {
            props.setClaim(false)
          }}
        >
          <IconClose color={theme.colors.tertiary} size={'24'} />
        </CloseStyled>

        {transactionStep === TransactionStep.idle && <DaiIcon size={'64'} />}
        {transactionStep === TransactionStep.waitingConfirmation && <Spinner big />}
        {transactionStep === TransactionStep.transactionSubmitted && (
          <Reversed>
            <IconArrowUp size={'64'} />
          </Reversed>
        )}
        {transactionStep === TransactionStep.transactionConfirmed && (
          <Reversed>
            <IconArrowUp color={theme.colors.green} size={'64'} />
          </Reversed>
        )}

        <ClaimAmount>Claim {formatBigNumber(props.unclaimedAmount, STANDARD_DECIMALS, 2)} DAI</ClaimAmount>
        {transactionStep === TransactionStep.idle && (
          <SecondaryText>
            Transfers from xDai Network <br /> need to be claimed
          </SecondaryText>
        )}
        {transactionStep === TransactionStep.waitingConfirmation ? (
          <SecondaryText>Waiting Confirmation</SecondaryText>
        ) : transactionStep === TransactionStep.transactionSubmitted ||
          transactionStep === TransactionStep.transactionConfirmed ? (
          <TransactionLink
            href={getTxHashBlockExplorerURL(networkId, transactionHash)}
            rel="noopener noreferrer"
            target="_blank"
          >
            {transactionStep === TransactionStep.transactionSubmitted
              ? 'Transaction submitted'
              : 'Transaction Confirmed'}
          </TransactionLink>
        ) : (
          ''
        )}
        {transactionStep === TransactionStep.idle ? (
          <ClaimButton
            buttonType={ButtonType.primary}
            onClick={() => {
              claimLatestToken()
            }}
            style={{ width: '252px' }}
          >
            Claim DAI
          </ClaimButton>
        ) : (
          <CloseButton
            onClick={() => {
              props.setClaim(false)
            }}
          >
            Close
          </CloseButton>
        )}
      </Modal>
    </ModalBackground>
  )
}
