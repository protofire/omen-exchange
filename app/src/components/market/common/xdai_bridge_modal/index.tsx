import { Zero } from 'ethers/constants'
import { BigNumber, formatUnits } from 'ethers/utils'
import React, { useState } from 'react'
import styled from 'styled-components'

import { useConnectedWeb3Context } from '../../../../hooks'
import { useXdaiBridge } from '../../../../hooks/useXdaiBridge'
import { knownTokens, networkIds } from '../../../../util/networks'
import { formatBigNumber } from '../../../../util/tools'
import { ButtonRound } from '../../../button/button_round'
import { BigNumberInput, TextfieldCustomPlaceholder } from '../../../common'
import { BigNumberInputReturn } from '../../../common/form/big_number_input'
import { IconAlertInverted } from '../../../common/icons/IconAlertInverted'
import { XDaiStake } from '../../../common/icons/currencies/XDaiStake'

import { TransactionState } from './bridge_transaction_state'

interface Prop {
  open: boolean
  setOpen: any
}

const BridgeWrapper = styled.div<{ isOpen: boolean }>`
  align-items: center;
  background-color: ${({ theme }) => theme.colors.mainBodyBackground};
  ${props => (!props.isOpen ? 'display:none' : 'display: flow-root')};
  font-size: ${props => props.theme.buttonRound.fontSize};
  line-height: ${props => props.theme.buttonRound.lineHeight};
  color: ${({ theme }) => theme.colors.textColorDark};
  border: ${({ theme }) => theme.borders.borderLineDisabled};
  transition: border-color 0.15s linear;
  user-select: none;
  justify-content: center;
  outline: none;
  position: absolute;
  border-radius: ${props => props.theme.dropdown.dropdownItems.borderRadius};
  top: calc(100% + 8px);
  width: 207.27px;
  z-index: 0;
  height: fit-content;
  box-shadow: ${props => props.theme.dropdown.dropdownItems.boxShadow};
  padding: 20px;
  user-select: text;
  @media only screen and (max-width: ${props => props.theme.themeBreakPoints.md}) {
    width: calc(100%);
    right: 1px;
  }
`

const ChainText = styled.div`
  text-align: start;
`
const BalanceText = styled.div<{ disabled: boolean }>`
  text-align: end;
  width: fit-content;
  color: ${({ disabled, theme }) => (disabled ? theme.colors.textColorLighter : theme.colors.clickable)};
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  &:hover {
    ${({ disabled, theme }) => !disabled && `color:${theme.colors.primaryLight}`};
  }
`

const MainnetWrapper = styled.div`
  margin-bottom: 12px;
  width: 100%;
  display: flex;
  justify-content: space-between;
`
const XDaiWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`
const BalanceWrapper = styled.div<{ isOpen: boolean }>`
  flex-wrap: wrap;
  ${props => (!props.isOpen ? 'display:none' : 'display: flow-root')};
`
const Warning = styled.div`
  color: ${({ theme }) => theme.colors.red};
  opacity: 80%;
  margin-left: 8px;
`
const WarningWrapper = styled.div`
  display: flex;
  margin-top: 8px;
`

const TextFieldCustomPlace = styled(TextfieldCustomPlaceholder)<{ error: boolean }>`
  margin-top: 20px;
  ${props => (props.error ? `border:1px solid ${props.theme.colors.red} !important` : '')};
  span {
    margin-right: 0px;
  }
`

const TransferButton = styled(ButtonRound)`
  margin-top: 20px;
  width: 100%;
`

const PoweredByStakeWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 20px;
  justify-content: center;
`
const StakeText = styled.a`
  margin-left: 8px;
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.clickable};
  line-height: 12px;
  &:hover {
    ${({ theme }) => `color:${theme.colors.primaryLight}`};
  }
`

export const XdaiBridgeTransfer = (props: Prop) => {
  const [amountToDisplay, setAmountToDisplay] = useState<string>('')
  const [amount, setAmount] = useState<BigNumber>(Zero)

  const { networkId } = useConnectedWeb3Context()
  const { decimals } = knownTokens['dai']

  const [transferState, setTransferState] = useState<boolean>(false)
  const errorEval =
    amount.gt(Zero) && Number(formatBigNumber(amount, decimals, 2)) < 10 && networkId != networkIds.MAINNET

  const {
    daiBalance,
    fetchBalance,
    numberOfConfirmations,
    transactionHash,
    transactionStep,
    transferFunction,
    xDaiBalance,
  } = useXdaiBridge(amount)
  return (
    <>
      <BridgeWrapper isOpen={props.open}>
        <BalanceWrapper isOpen={!transferState}>
          <MainnetWrapper>
            <ChainText>Mainnet</ChainText>
            <BalanceText
              disabled={networkId != networkIds.MAINNET}
              onClick={() => {
                if (daiBalance.eq(Zero) || networkId != networkIds.MAINNET) return
                setAmount(daiBalance)
                setAmountToDisplay(formatBigNumber(daiBalance, decimals))
              }}
            >
              {formatBigNumber(daiBalance, decimals)} DAI
            </BalanceText>
          </MainnetWrapper>
          <XDaiWrapper>
            <ChainText>xDai Chain</ChainText>
            <BalanceText
              disabled={networkId === networkIds.MAINNET}
              onClick={() => {
                if (xDaiBalance.eq(Zero) || networkId === networkIds.MAINNET) return
                setAmount(xDaiBalance)
                setAmountToDisplay(formatBigNumber(xDaiBalance, decimals))
              }}
            >
              {formatBigNumber(xDaiBalance, decimals)} XDAI
            </BalanceText>
          </XDaiWrapper>

          <TextFieldCustomPlace
            error={errorEval}
            formField={
              <BigNumberInput
                decimals={decimals}
                name="amounts"
                onChange={(e: BigNumberInputReturn) => {
                  setAmount(e.value)
                  setAmountToDisplay('')
                }}
                placeholder={networkId === networkIds.MAINNET ? '0' : '10'}
                style={{ width: 0 }}
                value={amount}
                valueToDisplay={amountToDisplay}
              />
            }
            symbol={networkId === networkIds.MAINNET ? 'DAI' : 'XDAI'}
          />
          {errorEval && (
            <WarningWrapper>
              <IconAlertInverted />
              <Warning>Minimum 10 xDai</Warning>
            </WarningWrapper>
          )}

          <TransferButton
            disabled={amount.eq(Zero) || (networkId === networkIds.XDAI && Number(formatUnits(amount, decimals)) < 10)}
            onClick={() => {
              setTransferState(!transferState)
              transferFunction()
              setAmountToDisplay(' ')
              setAmount(Zero)
            }}
          >
            Transfer
          </TransferButton>
          <PoweredByStakeWrapper>
            <XDaiStake />
            <StakeText href={'https://bridge.xdaichain.com/'} rel="noopener noreferrer" target="_blank">
              xDai Bridge
            </StakeText>
          </PoweredByStakeWrapper>
        </BalanceWrapper>
        {transferState && (
          <TransactionState
            amountToTransfer={amount}
            fetchBalance={fetchBalance}
            network={networkId}
            numberOfConfirmations={numberOfConfirmations}
            setBridgeOpen={props.setOpen}
            state={transactionStep}
            transactionHash={transactionHash}
            transactionModalVisibility={setTransferState}
          />
        )}
      </BridgeWrapper>
    </>
  )
}
