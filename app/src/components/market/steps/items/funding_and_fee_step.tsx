import React, { ChangeEvent, useEffect, useState } from 'react'
import styled from 'styled-components'
import { BigNumber } from 'ethers/utils'

import { Button, Textfield, BigNumberInput } from '../../../common/index'
import { ButtonContainer } from '../../../common/button_container'
import { CreateCard } from '../../../common/create_card'
import { FormRow } from '../../../common/form_row'
import { TextfieldCustomPlaceholder } from '../../../common/textfield_custom_placeholder'
import { ButtonLink } from '../../../common/button_link'
import { getToken } from '../../../../util/addresses'
import { useConnectedWeb3Context } from '../../../../hooks/connectedWeb3'
import { BalanceToken } from '../../../common/balance_token'
import { Collateral, CollateralCustomEvent, Token } from '../../../../util/types'
import { BigNumberInputReturn } from '../../../common/big_number_input'
import { TokensAddAnotherCustom } from '../../../common/tokens_add_another_custom'
import { ERC20Service } from '../../../../services'

interface Props {
  back: () => void
  next: () => void
  values: {
    collateralId: KnownToken | string
    collateralsCustom: Collateral[]
    spread: string
    funding: BigNumber
  }
  addCollateralCustom: (collateral: Collateral) => void
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

  const [collateral, setCollateral] = useState<Maybe<Token>>(null)

  useEffect(() => {
    let isSubscribed = true

    const fetchIsValidErc20 = async () => {
      let collateralData: Token
      const erc20Service = new ERC20Service(context.library, collateralId)
      const isValidErc20 = await erc20Service.isValidErc20()
      if (isValidErc20) {
        const data = await erc20Service.getProfileSummary()
        collateralData = {
          ...data,
        } as Token
      } else {
        collateralData = getToken(context.networkId, collateralId as KnownToken)
      }

      if (isSubscribed) setCollateral(collateralData)
    }

    fetchIsValidErc20()

    return () => {
      isSubscribed = false
    }
  }, [context, collateralId])

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
              networkId={context.networkId}
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
