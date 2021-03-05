import { BigNumber } from 'ethers/utils'
import React, { HTMLAttributes } from 'react'
import Modal from 'react-modal'
import styled, { withTheme } from 'styled-components'

import { useConnectedWeb3Context } from '../../../hooks'
import { formatBigNumber, getBlockExplorerURL } from '../../../util/tools'
import { Token, TransactionStep, TransactionType } from '../../../util/types'
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
}

export const ModalTransaction = (props: Props) => {
  const { icon, isOpen, message, onClose, theme, txHash, txState } = props
  const context = useConnectedWeb3Context()
  const { networkId } = context

  React.useEffect(() => {
    Modal.setAppElement('#root')
  }, [])

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} shouldCloseOnOverlayClick={true} style={theme.fluidHeightModal}>
      <ContentWrapper>
        <ModalNavigation>
          <ModalNavigationLeft></ModalNavigationLeft>
          <IconClose hoverEffect={true} onClick={onClose} />
        </ModalNavigation>
        <Spinner big={true} style={{ marginTop: '10px' }} />
        <ModalMainText>
          {message}
          {icon && <ModalTokenIcon src={icon} />}
        </ModalMainText>
        <ModalSubText>
          {txState === TransactionStep.waitingConfirmation
            ? 'Confirm Transaction'
            : TransactionStep.transactionSubmitted
            ? 'Transaction Submitted'
            : // TODO: Add confirming step
            // : TransactionStep.confirming
            // ? // TODO: Replace with dynamic amounts
            //   '1 out of 8 Confirmations'
            TransactionStep.transactionConfirmed
            ? 'Transaction Confirmed'
            : ''}
        </ModalSubText>
        <EtherscanButtonWrapper href={getBlockExplorerURL(networkId, txHash)} rel="noopener noreferrer" target="_blank">
          {/* TODO: Add disabled check */}
          <EtherscanButton buttonType={ButtonType.secondaryLine}>View on Etherscan</EtherscanButton>
        </EtherscanButtonWrapper>
      </ContentWrapper>
    </Modal>
  )
}

export const ModalTransactionWrapper = withTheme(ModalTransaction)
