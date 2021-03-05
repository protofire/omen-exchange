import { BigNumber, parseUnits } from 'ethers/utils'
import React, { HTMLAttributes, useState } from 'react'
import Modal from 'react-modal'
import styled, { withTheme } from 'styled-components'

import { useConnectedWeb3Context, useTokens } from '../../../hooks'
import { getToken } from '../../../util/networks'
import { formatBigNumber, formatNumber } from '../../../util/tools'
import { ExchangeType, TransactionStep, TransactionType } from '../../../util/types'
import { Button } from '../../button'
import { ButtonType } from '../../button/button_styling_types'
import { BigNumberInput, TextfieldCustomPlaceholder } from '../../common'
import { BigNumberInputReturn } from '../../common/form/big_number_input'
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
  ModalNavigationLeft,
  ModalTitle,
} from '../common_styled'
import { ModalTransactionWrapper } from '../modal_transaction'

const InputInfo = styled.p`
  font-size: ${props => props.theme.fonts.defaultSize};
  color: ${props => props.theme.colors.textColorLighter};
  margin: 0;
  margin-top: 12px;
  width: 100%;
`

const DepositWithdrawButton = styled(Button)`
  width: 100%;
  margin-top: 28px;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  exchangeType: ExchangeType
  isOpen: boolean
  onBack: () => void
  onClose: () => void
  theme?: any
}

export const ModalDepositWithdraw = (props: Props) => {
  const { exchangeType, isOpen, onBack, onClose, theme } = props
  const context = useConnectedWeb3Context()

  const [displayFundAmount, setDisplayFundAmount] = useState<Maybe<BigNumber>>(new BigNumber(0))
  const [amountToDisplay, setAmountToDisplay] = useState<string>('')
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false)

  React.useEffect(() => {
    Modal.setAppElement('#root')
  }, [])

  const { tokens } = useTokens(context, true, true)

  const daiBalance = new BigNumber(tokens.filter(token => token.symbol === 'DAI')[0]?.balance || '')
  const formattedDaiBalance = formatNumber(formatBigNumber(daiBalance, 18, 18))

  const DAI = getToken(1, 'dai')

  // TODO: Replace hardcoded value
  const isDepositWithdrawDisabled = true

  return (
    <>
      <Modal isOpen={isOpen} onRequestClose={onClose} shouldCloseOnOverlayClick={true} style={theme.fluidHeightModal}>
        <ContentWrapper>
          <ModalNavigation>
            <ModalNavigationLeft>
              <IconArrowBack
                hoverEffect={true}
                onClick={() => {
                  onBack()
                  setDisplayFundAmount(new BigNumber(0))
                  setAmountToDisplay('')
                }}
              />
              <ModalTitle style={{ marginLeft: '16px' }}>{exchangeType} Dai</ModalTitle>
            </ModalNavigationLeft>
            <IconClose
              hoverEffect={true}
              onClick={() => {
                onClose()
                setDisplayFundAmount(new BigNumber(0))
                setAmountToDisplay('')
              }}
            />
          </ModalNavigation>
          <ModalCard style={{ marginBottom: '16px', marginTop: '12px' }}>
            <BalanceSection>
              <BalanceItems>
                <BalanceItem>
                  <BalanceItemSide>
                    <BalanceItemTitle>Wallet</BalanceItemTitle>
                  </BalanceItemSide>
                  <BalanceItemSide>
                    <BalanceItemBalance style={{ marginRight: '12px' }}>{formattedDaiBalance} DAI</BalanceItemBalance>
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
          <TextfieldCustomPlaceholder
            formField={
              <BigNumberInput
                decimals={18}
                name="amount"
                onChange={(e: BigNumberInputReturn) => {
                  setDisplayFundAmount(e.value)
                  setAmountToDisplay('')
                }}
                value={displayFundAmount}
                valueToDisplay={amountToDisplay}
              ></BigNumberInput>
            }
            onClickMaxButton={() => {
              setDisplayFundAmount(daiBalance)
              setAmountToDisplay(formatBigNumber(daiBalance, 18, 5))
            }}
            shouldDisplayMaxButton={true}
            symbol={'DAI'}
          ></TextfieldCustomPlaceholder>
          <InputInfo>You need to deposit at least 10 DAI.</InputInfo>
          <DepositWithdrawButton buttonType={ButtonType.primaryAlternative} disabled={isDepositWithdrawDisabled}>
            {exchangeType}
          </DepositWithdrawButton>
        </ContentWrapper>
      </Modal>
      {/* TODO: Replace hardcoded props */}
      <ModalTransactionWrapper
        icon={DAI.image}
        isOpen={isTransactionModalOpen}
        message={`${exchangeType} ${formatBigNumber(displayFundAmount || new BigNumber(0), DAI.decimals)} ${
          DAI.symbol
        }`}
        onClose={() => setIsTransactionModalOpen(false)}
        txHash={'asdf'}
        txState={TransactionStep.waitingConfirmation}
      />
    </>
  )
}

export const ModalDepositWithdrawWrapper = withTheme(ModalDepositWithdraw)
