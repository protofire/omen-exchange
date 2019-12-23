import React, { ChangeEvent, useMemo } from 'react'
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
import { CustomizableTokensSelect } from '../../../common/customizable_tokens_select'
import { Token } from '../../../../util/types'
import { ERC20Service } from '../../../../services'
import { useAsyncDerivedValue } from '../../../../hooks/useAsyncDerivedValue'

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

const ErrorStyled = styled.span`
  margin-top: 0px;
  color: red;
  font-weight: 500;
`

const FundingAndFeeStep = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { library: provider, account, rawWeb3Context } = context

  const { values, addCollateralCustom, handleChange, handleCollateralChange } = props
  const { funding, spread, collateral, collateralsCustom } = values

  const calculateCollateralBalance = useMemo(
    () => async (): Promise<BigNumber> => {
      const collateralService = new ERC20Service(
        provider,
        rawWeb3Context.connectorName,
        collateral.address,
      )
      const collateralBalance = await collateralService.getCollateral(account || '')
      return collateralBalance
    },
    [provider, rawWeb3Context, account, collateral],
  )

  const collateralBalance = useAsyncDerivedValue('', new BigNumber(0), calculateCollateralBalance)

  const isFundingGreaterThanBalance =
    rawWeb3Context.connectorName !== 'Infura' ? funding.gt(collateralBalance) : false
  const error = !spread || funding.isZero() || isFundingGreaterThanBalance

  const fundingMessageError = isFundingGreaterThanBalance
    ? `You don't have enough collateral in your balance.`
    : ''

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
                onChange={handleChange}
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
          <CustomizableTokensSelect
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
                onChange={handleChange}
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
          <>
            <BalanceToken
              collateral={collateral}
              onClickMax={(collateral: Token, collateralBalance: BigNumber) => {
                handleChange({ name: 'funding', value: collateralBalance })
              }}
            />
            <ErrorStyled>{fundingMessageError}</ErrorStyled>
          </>
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
