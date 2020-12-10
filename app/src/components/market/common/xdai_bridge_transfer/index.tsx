import { BigNumber } from 'ethers/utils'
import React, { useMemo, useState } from 'react'
import styled from 'styled-components'

import { useCpk, useCpkAllowance } from '../../../../hooks'
import { RemoteData } from '../../../../util/remote_data'
import { ButtonRound } from '../../../button/button_round'
import { BigNumberInput, TextfieldCustomPlaceholder } from '../../../common'
import { BigNumberInputReturn } from '../../../common/form/big_number_input'
import { SetAllowance } from '../set_allowance'
import { ToggleTokenLock } from '../toggle_token_lock'

interface Props {
  open: boolean
  provider: any
}

const BridgeWrapper = styled(ButtonRound)<{ isOpen: boolean }>`
  ${props => (!props.isOpen ? 'display:none' : '')};
  position: absolute;
  top: calc(100% + 8px);
  width: 207.27px;
  right: 207.27px;
  z-index: 4321;
  height: fit-content;
  box-shadow: ${props => props.theme.dropdown.dropdownItems.boxShadow};
  padding: 17px 20px;
  display: flow-root;
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
const BalanceWrapper = styled.div`
  flex-wrap: wrap;
`
const AllowanceButton = styled(ButtonRound)`
  width: 100%;
  margin-top: 20px;
  color: ${props => props.theme.colors.textColorDark};
  //background-color: ;
`

const TextFieldCustomPlace = styled(TextfieldCustomPlaceholder)`
  margin-top: 20px;
  span {
    margin-right: 0px;
  }
`
const ToogleTokenLocker = styled(ToggleTokenLock)`
  button {
    width: 100% !important;
  }
`

export const XdaiBridgeTransfer: React.FC<Props> = props => {
  const cpk = useCpk()
  const signer = useMemo(() => props.provider.getSigner(), [props.provider])
  // const { allowance, unlock } = useCpkAllowance(signer, 'collateral.address')
  const [amountToDisplay, setAmountToDisplay] = useState<string>('')
  const [allowanceFinished, setAllowanceFinished] = useState(false)
  const [amount, setAmount] = useState<Maybe<BigNumber>>(new BigNumber(0))
  const unlockCollateral = async () => {
    if (!cpk) {
      return
    }

    // await unlock()

    setAllowanceFinished(true)
  }
  return (
    <BridgeWrapper isOpen={props.open}>
      <BalanceWrapper>
        <MainnetWrapper>
          <ChainText>Mainnet</ChainText>
          <BalanceText>1225 DAI</BalanceText>
        </MainnetWrapper>
        <XDaiWrapper>
          <ChainText>xDai Chain</ChainText>
          <BalanceText>0 XDAI</BalanceText>
        </XDaiWrapper>
      </BalanceWrapper>
      <TextFieldCustomPlace
        formField={
          <BigNumberInput
            decimals={18}
            name="amount"
            onChange={(e: BigNumberInputReturn) => {
              console.log('e')
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
      {/*<AllowanceButton>Set Allowance</AllowanceButton>*/}
      <ToogleTokenLocker finished={true} loading={false} />
    </BridgeWrapper>
  )
}
