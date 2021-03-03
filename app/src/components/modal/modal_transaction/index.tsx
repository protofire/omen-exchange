import { BigNumber } from 'ethers/utils'
import React, { HTMLAttributes } from 'react'
import Modal from 'react-modal'
import styled, { withTheme } from 'styled-components'

import { formatBigNumber } from '../../../util/tools'
import { Token, TransactionState, TransactionType } from '../../../util/types'
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
  margin-top: 32px;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  amount?: BigNumber
  collateral: Token
  isOpen: boolean
  theme?: any
  txState: TransactionState
  txType: TransactionType
}

export const ModalTransaction = (props: Props) => {
  const { amount, collateral, isOpen, theme, txState, txType } = props

  React.useEffect(() => {
    Modal.setAppElement('#root')
  }, [])

  return (
    <Modal isOpen={isOpen} style={theme.fluidHeightModal}>
      <ContentWrapper>
        <ModalNavigation>
          <ModalNavigationLeft></ModalNavigationLeft>
          {/* TODO: Add onClick */}
          <IconClose hoverEffect={true} />
        </ModalNavigation>
        <Spinner big={true} style={{ marginTop: '10px' }} />
        <ModalMainText>
          {txType} {formatBigNumber(amount || new BigNumber(0), collateral.decimals, 2)} {collateral.symbol}
          <ModalTokenIcon src={collateral.image} />
        </ModalMainText>
        <ModalSubText>
          {txState === TransactionState.waiting
            ? 'Confirm Transaction'
            : TransactionState.submitted
            ? 'Transaction Submitted'
            : TransactionState.confirming
            ? // TODO: Replace with dynamic amounts
              '1 out of 8 Confirmations'
            : TransactionState.confirmed
            ? 'Transaction Confirmed'
            : ''}
        </ModalSubText>
        {/* TODO: Add disabled check */}
        <EtherscanButton buttonType={ButtonType.secondaryLine}>View on Etherscan</EtherscanButton>
      </ContentWrapper>
    </Modal>
  )
}

export const ModalTransactionWrapper = withTheme(ModalTransaction)
