import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import { DEFAULT_TOKEN_ADDRESS } from '../../../../common/constants'
import { useConnectedWeb3Context } from '../../../../hooks'
import { useXdaiBridge } from '../../../../hooks/useXdaiBridge'
import { ERC20Service } from '../../../../services'
import { formatBigNumber } from '../../../../util/tools'
import { ButtonRound } from '../../../button/button_round'
import { BigNumberInput, TextfieldCustomPlaceholder } from '../../../common'
import { BigNumberInputReturn } from '../../../common/form/big_number_input'
import { XDaiStake } from '../../../common/icons/currencies/XDaiStake'
import { SetAllowance } from '../set_allowance_bridge'

import { TransactionState } from './bridge_transaction_state'

interface Prop {
  open: boolean
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
  color: ${({ theme }) => theme.colors.clickable};
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
  color: ${({ theme }) => theme.colors.clickable};
`

export const XdaiBridgeTransfer = (props: Prop) => {
  const [amountToDisplay, setAmountToDisplay] = useState<string>('')
  const [amount, setAmount] = useState<BigNumber>(new BigNumber(0))
  const [xDaiBalance, setXdaiBalance] = useState<BigNumber>(Zero)
  const { account, library: provider, networkId } = useConnectedWeb3Context()

  const [transferState, setTransferState] = useState<boolean>(false)

  const [daiBalance, setDaiBalance] = useState<BigNumber>(Zero)

  const { state, transferFunction } = useXdaiBridge(networkId, networkId === 1 ? daiBalance : xDaiBalance)

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        if (networkId === 1) {
          const collateralService = new ERC20Service(provider, account, DEFAULT_TOKEN_ADDRESS)
          setDaiBalance(await collateralService.getCollateral(account || ''))
        } else {
          const balance = await provider.getBalance(account || '')
          setXdaiBalance(balance)
        }
      } catch (error) {
        setXdaiBalance(Zero)
      }
    }
    setDaiBalance(Zero)
    setXdaiBalance(Zero)
    fetchBalance()
  }, [account, provider, networkId])

  return (
    <>
      <BridgeWrapper isOpen={props.open}>
        <BalanceWrapper isOpen={!transferState}>
          <MainnetWrapper>
            <ChainText>Mainnet</ChainText>
            <BalanceText
              onClick={() => {
                setAmount(daiBalance)
                setAmountToDisplay(formatBigNumber(daiBalance, 18))
              }}
            >
              {formatBigNumber(daiBalance, 18)} DAI
            </BalanceText>
          </MainnetWrapper>
          <XDaiWrapper>
            <ChainText>xDai Chain</ChainText>
            <BalanceText>{formatBigNumber(xDaiBalance, 18)} XDAI</BalanceText>
          </XDaiWrapper>

          <TextFieldCustomPlace
            formField={
              <BigNumberInput
                decimals={18}
                name="amounts"
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
          {networkId === 1 && <SetAllowance selectedAmount={amount} />}

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
        {transferState && <TransactionState changeTransferState={setTransferState} />}
      </BridgeWrapper>
    </>
  )
}
