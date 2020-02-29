import { BigNumber } from 'ethers/utils'
import React, { ChangeEvent } from 'react'
import styled from 'styled-components'

import { MARKET_FEE } from '../../../../common/constants'
import { useConnectedWeb3Context } from '../../../../hooks/connectedWeb3'
import { useCollateralBalance } from '../../../../hooks/useCollateralBalance'
import { Token } from '../../../../util/types'
import { BalanceToken } from '../../../common/balance_token'
import { BigNumberInputReturn } from '../../../common/big_number_input'
import { ButtonContainer } from '../../../common/button_container'
import { ButtonLink } from '../../../common/button_link'
import { CreateCard } from '../../../common/create_card'
import { CustomizableTokensSelect } from '../../../common/customizable_tokens_select'
import { FormError } from '../../../common/form_error'
import { FormRow } from '../../../common/form_row'
import { BigNumberInput, Button, Textfield } from '../../../common/index'
import { TextfieldCustomPlaceholder } from '../../../common/textfield_custom_placeholder'

interface Props {
  back: () => void
  next: () => void
  values: {
    collateral: Token
    collateralsCustom: Token[]
    spread: number
    funding: BigNumber
  }
  handleCollateralChange: (collateral: Token) => void
  addCollateralCustom: (collateral: Token) => void
  handleChange: (event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement> | BigNumberInputReturn) => any
}

const ButtonLinkStyled = styled(ButtonLink)`
  margin-right: auto;
`

const TextfieldStyledRight = styled<any>(Textfield)`
  text-align: right;
`

const BigNumberInputTextRight = styled<any>(BigNumberInput)`
  text-align: right;
`

const FundingAndFeeStep = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { account } = context

  const { addCollateralCustom, handleChange, handleCollateralChange, values } = props
  const { collateral, collateralsCustom, funding, spread } = values

  const collateralBalance = useCollateralBalance(collateral, context)

  const isFundingGreaterThanBalance = account ? funding.gt(collateralBalance) : false
  const error = !spread || funding.isZero() || isFundingGreaterThanBalance

  const fundingMessageError = isFundingGreaterThanBalance ? `You don't have enough collateral in your balance.` : ''

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
          description: `The fee taken from every trade. Temporarily fixed at ${MARKET_FEE}%.`,
        }}
      />
      <FormRow
        formField={
          <CustomizableTokensSelect
            addCustomValue={addCollateralCustom}
            context={context}
            customValues={collateralsCustom}
            name="collateralId"
            onCollateralChange={handleCollateralChange}
            value={collateral}
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
              <BigNumberInputTextRight
                decimals={collateral.decimals}
                name="funding"
                onChange={handleChange}
                value={funding}
              />
            }
            placeholderText={collateral.symbol}
          />
        }
        note={
          <>
            {account && (
              <BalanceToken
                collateral={collateral}
                collateralBalance={collateralBalance}
                onClickAddMaxCollateral={() => handleChange({ name: 'funding', value: collateralBalance })}
              />
            )}
            <FormError>{fundingMessageError}</FormError>
          </>
        }
        title={'Funding'}
        tooltip={{
          id: `funding`,
          description: `Initial funding to fund the market maker.`,
        }}
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
