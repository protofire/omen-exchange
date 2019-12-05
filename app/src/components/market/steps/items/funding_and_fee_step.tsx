import React, { ChangeEvent } from 'react'
import styled from 'styled-components'
import { BigNumber } from 'ethers/utils'

import { Button, Textfield, BigNumberInput } from '../../../common/index'
import { ButtonContainer } from '../../../common/button_container'
import { CreateCard } from '../../../common/create_card'
import { FormRow } from '../../../common/form_row'
import { TextfieldCustomPlaceholder } from '../../../common/textfield_custom_placeholder'
import { ButtonLink } from '../../../common/button_link'
import { useConnectedWeb3Context } from '../../../../hooks/connectedWeb3'
import { BalanceToken } from '../../../common/balance_token'
import { BigNumberInputReturn } from '../../../common/big_number_input'
import { TokensAddAnotherCustom } from '../../../common/tokens_add_another_custom'

interface Props {
  back: () => void
  next: () => void
  values: {
    collateral: Token
    collateralsCustom: Token[]
    spread: string
    funding: BigNumber
  }
  handleCollateralChange: (collateral: Token) => void
  addCollateralCustom: (collateral: Token) => void
  handleChange: (
    event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement> | BigNumberInputReturn,
  ) => any
}

const ButtonLinkStyled = styled(ButtonLink)`
  margin-right: auto;
`

const TextfieldStyledRight = styled<any>(Textfield)`
  text-align: right;
`

const InputBigNumberStyledRight = styled<any>(BigNumberInput)`
  text-align: right;
`

const FundingAndFeeStep = (props: Props) => {
  const context = useConnectedWeb3Context()

  const { values, addCollateralCustom, handleCollateralChange } = props
  const { funding, spread, collateral, collateralsCustom } = values
  const error = !spread || funding.isZero()

  const back = () => {
    props.back()
  }

  const nextSection = (e: any) => {
    e.preventDefault()
    if (!error) {
      props.next()
    }
  }

  return (
    <CreateCard>
      <FormRow
        formField={
          <TextfieldCustomPlaceholder
            disabled={true}
            formField={
              <TextfieldStyledRight
                defaultValue={spread}
                disabled
                name="spread"
                onChange={(e: any) => props.handleChange(e)}
                type="number"
              />
            }
            placeholderText="%"
          />
        }
        title={'Spread / Fee'}
        tooltip={{
          id: `spreadFee`,
          description: `The fee taken from every trade. Temporarily fixed at 1%.`,
        }}
      />
      <FormRow
        formField={
          <TokensAddAnotherCustom
            context={context}
            name="collateralId"
            value={collateral}
            customValues={collateralsCustom}
            addCustomValue={addCollateralCustom}
            onCollateralChange={handleCollateralChange}
          />
        }
        title={'Collateral token'}
        tooltip={{
          id: `collateralToken`,
          description: `Select the token you want to use as collateral.`,
        }}
      />
      <FormRow
        formField={
          <TextfieldCustomPlaceholder
            formField={
              <InputBigNumberStyledRight
                name="funding"
                value={funding}
                onChange={(e: any) => props.handleChange(e)}
                decimals={collateral.decimals}
              />
            }
            placeholderText={collateral.symbol}
          />
        }
        title={'Funding'}
        tooltip={{
          id: `funding`,
          description: `Initial funding to fund the market maker.`,
        }}
        note={
          <BalanceToken
            collateral={collateral}
            onClickMax={(collateral: Token, collateralBalance: BigNumber) => {
              props.handleChange({ name: 'funding', value: collateralBalance })
            }}
          />
        }
      />
      <ButtonContainer>
        <ButtonLinkStyled onClick={() => back()}>‹ Back</ButtonLinkStyled>
        <Button disabled={error} onClick={(e: any) => nextSection(e)}>
          Next
        </Button>
      </ButtonContainer>
    </CreateCard>
  )
}

export { FundingAndFeeStep }
