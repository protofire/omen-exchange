import { BigNumber } from 'ethers/utils'
import React, { useState } from 'react'
import styled from 'styled-components'

import { ButtonRound } from '../../../button/button_round'
import { BigNumberInput, TextfieldCustomPlaceholder } from '../../../common'
import { BigNumberInputReturn } from '../../../common/form/big_number_input'
import { XDaiStake } from '../../../common/icons/currencies/XDaiStake'
import { SetAllowance } from '../set_allowance_bridge'

interface Props {
  open: boolean
  provider: any
}

const BridgeWrapper = styled(ButtonRound)<{ isOpen: boolean }>`
  ${props => (!props.isOpen ? 'display:none' : 'display: flow-root')};
  position: absolute;
  top: calc(100% + 8px);
  width: 207.27px;
  right: 207.27px;
  z-index: 0;
  height: fit-content;
  box-shadow: ${props => props.theme.dropdown.dropdownItems.boxShadow};
  padding: 17px 20px;
  @media only screen and (max-width: ${props => props.theme.themeBreakPoints.md}) {
    top: calc(100% + 54px);
    width: calc(100% - 20px);
    right: 10px;
  }
`

const ChainText = styled.div`
  text-align: start;
  width: 50%;
`
const BalanceText = styled.div`
  text-align: end;
  width: 50%;
  color: #86909e;
`
const MainnetWrapper = styled.div`
  margin-bottom: 12px;
  width: 100%;
  display: flex;
`
const XDaiWrapper = styled.div`
  width: 100%;
  display: flex;
`
const BalanceWrapper = styled.div<{ isOpen: boolean }>`
  flex-wrap: wrap;
  ${props => (!props.isOpen ? 'display:none' : 'display: flow-root')};
`

const TextFieldCustomPlace = styled(TextfieldCustomPlaceholder)`
  margin-top: 20px;
  span {
    margin-right: 0px;
  }
`

const TransferButton = styled(ButtonRound)`
  margin-top: 12px;
  width: 100%;
`
const PoweredByStakeWrapper = styled.div`
  display: flex;

  margin-top: 16px;
  margin-left: 6px;
`
const StakeText = styled.div`
  margin-left: 8px;
  font-size: 11px;
  font-weight: 500;
  color: #7986cb;
`
const TransferState = styled.div<{ show: boolean }>`
  ${props => (!props.show ? 'display:none' : 'display: flow-root')};
`

export const XdaiBridgeTransfer: React.FC<Props> = props => {
  const [amountToDisplay, setAmountToDisplay] = useState<string>('')
  const [amount, setAmount] = useState<BigNumber>(new BigNumber(0))
  const [transferState, setTransferState] = useState<boolean>(false)

  return (
    <>
      <BridgeWrapper isOpen={props.open}>
        <BalanceWrapper isOpen={!transferState}>
          <MainnetWrapper>
            <ChainText>Mainnet</ChainText>
            <BalanceText>1225 DAI</BalanceText>
          </MainnetWrapper>
          <XDaiWrapper>
            <ChainText>xDai Chain</ChainText>
            <BalanceText>0 XDAI</BalanceText>
          </XDaiWrapper>

          <TextFieldCustomPlace
            formField={
              <BigNumberInput
                decimals={18}
                name="amount"
                onChange={(e: BigNumberInputReturn) => {
                  setAmount(e.value)
                  setAmountToDisplay('')
                }}
                style={{ width: 0 }}
                value={amount}
                valueToDisplay={amountToDisplay}
              />
            }
            symbol={'DAI'}
          />
          <SetAllowance selectedAmount={amount} />

          <TransferButton
            onClick={() => {
              setTransferState(!transferState)
            }}
          >
            Transfer
          </TransferButton>
          <PoweredByStakeWrapper>
            <XDaiStake />
            <StakeText>Powered by STAKE Bridge</StakeText>
          </PoweredByStakeWrapper>
        </BalanceWrapper>
        <TransferState show={transferState}>Milan</TransferState>
      </BridgeWrapper>
    </>
  )
}
