import { Zero } from 'ethers/constants'
import { BigNumber, parseEther } from 'ethers/utils'
import React, { HTMLAttributes, useEffect, useState } from 'react'
import Modal from 'react-modal'
import styled, { withTheme } from 'styled-components'

import { useCollateralBalance, useConnectedCPKContext, useConnectedWeb3Context, useTokens } from '../../../hooks'
import { getNativeAsset, getToken } from '../../../util/networks'
import { formatBigNumber, formatNumber, waitABit, waitForConfirmations } from '../../../util/tools'
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
  fetchUnclaimedAssets: () => void
}

export const ModalDepositWithdraw = (props: Props) => {
  const { exchangeType, fetchUnclaimedAssets, isOpen, onBack, onClose, theme } = props
  const context = useConnectedWeb3Context()
  const cpk = useConnectedCPKContext()

  const [displayFundAmount, setDisplayFundAmount] = useState<BigNumber>(new BigNumber(0))
  const [amountToDisplay, setAmountToDisplay] = useState<string>('')
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false)
  const [txHash, setTxHash] = useState('')
  const [txState, setTxState] = useState<TransactionStep>(TransactionStep.waitingConfirmation)
  const [confirmations, setConfirmations] = useState(0)

  React.useEffect(() => {
    Modal.setAppElement('#root')
  }, [])

  const { tokens } = useTokens(context.rawWeb3Context, true, true)

  const daiBalance = new BigNumber(tokens.filter(token => token.symbol === 'DAI')[0]?.balance || '')
  const formattedDaiBalance = formatNumber(formatBigNumber(daiBalance, 18, 18))

  const DAI = getToken(1, 'dai')

  const nativeAsset = getNativeAsset(context.networkId)
  const { collateralBalance: maybeCollateralBalance } = useCollateralBalance(getNativeAsset(context.networkId), context)
  const balance = `${formatBigNumber(maybeCollateralBalance || Zero, nativeAsset.decimals, 2)}`

  const wallet = exchangeType === ExchangeType.deposit ? daiBalance : maybeCollateralBalance
  const minDeposit = parseEther('10')
  const isDepositWithdrawDisabled =
    displayFundAmount.isZero() || !wallet || displayFundAmount.gt(wallet) || displayFundAmount.lt(minDeposit)

  const deposit = async () => {
    if (!cpk) {
      return
    }

    setTxState(TransactionStep.waitingConfirmation)
    setConfirmations(0)
    setIsTransactionModalOpen(true)

    const hash =
      exchangeType === ExchangeType.deposit
        ? await cpk.sendDaiToBridge(displayFundAmount)
        : await cpk.sendXdaiToBridge(displayFundAmount)
    setTxHash(hash)
    const provider = exchangeType === ExchangeType.deposit ? context.rawWeb3Context.library : context.library
    await waitForConfirmations(hash, provider, setConfirmations, setTxState)
    fetchUnclaimedAssets()
  }

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
                    <BalanceItemBalance style={{ marginRight: '12px' }}>{balance} DAI</BalanceItemBalance>
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
              const maxBalance = exchangeType === ExchangeType.deposit ? daiBalance : maybeCollateralBalance || Zero
              setDisplayFundAmount(maxBalance)
              setAmountToDisplay(formatBigNumber(maxBalance, 18, 5))
            }}
            shouldDisplayMaxButton={true}
            symbol={'DAI'}
          ></TextfieldCustomPlaceholder>
          <InputInfo>
            You need to {exchangeType === ExchangeType.deposit ? 'deposit' : 'withdraw'} at least 10 DAI.
          </InputInfo>
          <DepositWithdrawButton
            buttonType={ButtonType.primaryAlternative}
            disabled={isDepositWithdrawDisabled}
            onClick={deposit}
          >
            {exchangeType}
          </DepositWithdrawButton>
        </ContentWrapper>
      </Modal>
      {/* TODO: Replace hardcoded props */}
      <ModalTransactionWrapper
        confirmations={confirmations}
        icon={DAI.image}
        isOpen={isTransactionModalOpen}
        message={`${exchangeType} ${formatBigNumber(displayFundAmount || new BigNumber(0), DAI.decimals)} ${
          DAI.symbol
        }`}
        onClose={() => setIsTransactionModalOpen(false)}
        txHash={txHash}
        txState={txState}
      />
    </>
  )
}

export const ModalDepositWithdrawWrapper = withTheme(ModalDepositWithdraw)
