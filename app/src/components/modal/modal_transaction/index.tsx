import React, { HTMLAttributes } from 'react'
import Modal from 'react-modal'
import styled, { withTheme } from 'styled-components'

import { useConnectedWeb3Context } from '../../../hooks'
import { getBlockExplorerURL } from '../../../util/tools'
import { TransactionStep } from '../../../util/types'
import { Button } from '../../button'
import { ButtonType } from '../../button/button_styling_types'
import { Spinner } from '../../common'
import { IconClose } from '../../common/icons'
import { ContentWrapper, ModalNavigation, ModalNavigationLeft } from '../common_styled'

const ModalMainText = styled.p`
  font-size: 16px;
  color: ${props => props.theme.colors.textColorDark};
  margin: 0;
  font-weight: 500;
  margin-top: 28px
  margin-bottom: 8px;
  display: flex;
  align-items: center;
`

const ModalTokenIcon = styled.img`
  width: 24px;
  height: 24px;
  margin-left: 10px;
`

const ModalSubText = styled.p`
  font-size: ${props => props.theme.fonts.defaultFontSize};
  color: ${props => props.theme.colors.textColorLighter};
  margin: 0;
`

const EtherscanButton = styled(Button)`
  width: 100%;
`

const EtherscanButtonWrapper = styled.a`
  width: 100%;
  margin-top: 32px;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  icon?: string
  isOpen: boolean
  message: string
  onClose: () => void
  theme?: any
  txHash: string
  txState: TransactionStep
  confirmations: number
  confirmationsRequired?: number
  netId?: number
}

export const ModalTransaction = (props: Props) => {
  const {
    confirmations,
    confirmationsRequired = 8,
    icon,
    isOpen,
    message,
    netId,
    onClose,
    theme,
    txHash,
    txState,
  } = props
  const context = useConnectedWeb3Context()
  const networkId = netId ? netId : context.networkId

  React.useEffect(() => {
    Modal.setAppElement('#root')
  }, [])

  const etherscanDisabled =
    txState !== TransactionStep.transactionSubmitted &&
    txState !== TransactionStep.transactionConfirmed &&
    txState !== TransactionStep.confirming

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} shouldCloseOnOverlayClick={true} style={theme.fluidHeightModal}>
      <ContentWrapper>
        <ModalNavigation>
          <ModalNavigationLeft></ModalNavigationLeft>
          <IconClose hoverEffect={true} onClick={onClose} />
        </ModalNavigation>
        {txState !== TransactionStep.transactionConfirmed && <Spinner big={true} style={{ marginTop: '10px' }} />}
        <ModalMainText>
          {message}
          {icon && <ModalTokenIcon src={icon} />}
        </ModalMainText>
        <ModalSubText>
          {txState === TransactionStep.waitingConfirmation
            ? 'Confirm Transaction'
            : txState === TransactionStep.transactionSubmitted
            ? 'Transaction Submitted'
            : txState === TransactionStep.confirming
            ? `${confirmations} out of ${confirmationsRequired} Confirmations`
            : txState === TransactionStep.transactionConfirmed
            ? 'Transaction Confirmed'
            : ''}
        </ModalSubText>
        <EtherscanButtonWrapper
          href={etherscanDisabled ? undefined : getBlockExplorerURL(networkId, txHash)}
          rel="noopener noreferrer"
          target="_blank"
        >
          <EtherscanButton buttonType={ButtonType.secondaryLine} disabled={etherscanDisabled}>
            View on Etherscan
          </EtherscanButton>
        </EtherscanButtonWrapper>
      </ContentWrapper>
    </Modal>
  )
}

export const ModalTransactionWrapper = withTheme(ModalTransaction)
