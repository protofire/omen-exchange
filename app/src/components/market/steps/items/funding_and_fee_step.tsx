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
import { CollateralCustomEvent, Token } from '../../../../util/types'
import { BigNumberInputReturn } from '../../../common/big_number_input'
import { TokensAddAnotherCustom } from '../../../common/tokens_add_another_custom'
import { useCollateral } from '../../../../hooks/useCollateral'

interface Props {
  back: () => void
  next: () => void
  values: {
    collateralId: KnownToken | string
    collateralsCustom: Token[]
    spread: string
    funding: BigNumber
  }
  addCollateralCustom: (collateral: Token) => void
  handleChange: (
    event:
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLSelectElement>
      | BigNumberInputReturn
      | CollateralCustomEvent,
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

  const { values, addCollateralCustom } = props
  const { funding, spread, collateralId, collateralsCustom } = values
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

  const collateral = useCollateral(collateralId, context)

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
      {collateral && (
        <FormRow
          formField={
            <TokensAddAnotherCustom
              context={context}
              name="collateralId"
              value={collateral}
              customValues={collateralsCustom}
              addCustomValue={addCollateralCustom}
              onChange={(e: any) => props.handleChange(e)}
            />
          }
          title={'Collateral token'}
          tooltip={{
            id: `collateralToken`,
            description: `Select the token you want to use as collateral.`,
          }}
        />
      )}
      {collateral && (
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
      )}
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
