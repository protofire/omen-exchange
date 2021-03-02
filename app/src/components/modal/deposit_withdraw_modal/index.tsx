import React, { HTMLAttributes } from 'react'
import Modal from 'react-modal'
import styled, { withTheme } from 'styled-components'

import { ExchangeType } from '../../../util/types'
import { IconArrowBack, IconClose } from '../../common/icons'
import { DaiIcon } from '../../common/icons/currencies'
import {
  BalanceItem,
  BalanceItemBalance,
  BalanceItemSide,
  BalanceItemTitle,
  BalanceItems,
  BalanceSection,
  ContentWrapper,
  ModalCard,
  ModalNavigation,
  ModalTitle,
} from '../common_styled'

interface Props extends HTMLAttributes<HTMLDivElement> {
  exchangeType: ExchangeType
  isOpen: boolean
  onBack: () => void
  onClose: () => void
  theme?: any
}

export const DepositWithdrawModal = (props: Props) => {
  const { exchangeType, isOpen, onBack, onClose, theme } = props

  React.useEffect(() => {
    Modal.setAppElement('#root')
  }, [])

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={theme.fluidHeightModal}>
      <ContentWrapper>
        <ModalNavigation>
          <IconArrowBack hoverEffect={true} onClick={onBack} />
          <ModalTitle>{exchangeType} Dai</ModalTitle>
          <IconClose hoverEffect={true} onClick={onClose} />
        </ModalNavigation>
        <ModalCard>
          <BalanceSection>
            <BalanceItems>
              <BalanceItem>
                <BalanceItemSide>
                  <BalanceItemTitle>Wallet</BalanceItemTitle>
                </BalanceItemSide>
                <BalanceItemSide>
                  {/* TODO: Replace hardcoded balance */}
                  <BalanceItemBalance style={{ marginRight: '12px' }}>125.00 DAI</BalanceItemBalance>
                  <DaiIcon size="24px" />
                </BalanceItemSide>
              </BalanceItem>
              <BalanceItem>
                <BalanceItemSide>
                  <BalanceItemTitle>Omen Account</BalanceItemTitle>
                </BalanceItemSide>
                <BalanceItemSide>
                  {/* TODO: Replace hardcoded balance */}
                  <BalanceItemBalance style={{ marginRight: '12px' }}>0.00 DAI</BalanceItemBalance>
                  <DaiIcon size="24px" />
                </BalanceItemSide>
              </BalanceItem>
            </BalanceItems>
          </BalanceSection>
        </ModalCard>
      </ContentWrapper>
    </Modal>
  )
}

export const DepositWithdrawModalWrapper = withTheme(DepositWithdrawModal)
