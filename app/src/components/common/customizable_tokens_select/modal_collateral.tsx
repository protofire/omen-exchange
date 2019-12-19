import React, { useState, HTMLAttributes, ChangeEvent } from 'react'
import styled from 'styled-components'
import { Textfield } from '../textfield'
import { SubsectionTitle } from '../subsection_title'
import { TitleValue } from '../title_value'
import { Button } from '../button'
import { Token } from '../../../util/types'
import { useCollateral } from '../../../hooks/useCollateral'
import { ConnectedWeb3Context } from '../../../hooks/connectedWeb3'
import { ButtonType } from '../../../common/button_styling_types'
import ModalWrapper from '../modal_wrapper'
import { FormRow } from '../form_row'

const Grid = styled.div`
  column-gap: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
`

const ButtonStyled = styled(Button)`
  margin-top: 80px;
`

const SubsectionTitleStyled = styled(SubsectionTitle)`
  font-size: 15px;
`

const TitleValueStyled = styled(TitleValue)`
  display: flex;

  > p {
    margin-left: 5px;
  }
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  context: ConnectedWeb3Context
  isOpen: boolean
  onClose: () => void
  onSave: (collateral: Token) => void
}

export const ModalCollateral = (props: Props) => {
  const { onClose, onSave, context, isOpen } = props
  const [collateralAddress, setCollateralAddress] = useState<string>('')
  const { collateral, errorMessage } = useCollateral(collateralAddress, context)

  const collateralWithAddress: Maybe<Token> = collateral
    ? { address: collateralAddress, ...collateral }
    : null

  const onClickSaveButton = () => {
    if (collateralWithAddress) {
      onSave(collateralWithAddress)
      onClose()
    }
  }

  const tokenDetails = () => {
    return collateralWithAddress ? (
      <>
        <SubsectionTitleStyled>Details</SubsectionTitleStyled>
        <Grid>
          <TitleValueStyled
            title={'Symbol:'}
            value={collateralWithAddress && collateralWithAddress.symbol}
          />
          <TitleValueStyled
            title={'Decimals:'}
            value={collateralWithAddress && collateralWithAddress.decimals}
          />
        </Grid>
      </>
    ) : null
  }

  return (
    <ModalWrapper isOpen={isOpen} onRequestClose={onClose} title={`Add Collateral`}>
      <FormRow
        formField={
          <Textfield
            hasError={errorMessage ? true : false}
            name="collateralAddress"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const { value } = event.target
              setCollateralAddress(value)
            }}
            placeholder="Type in a collateral address..."
            type="text"
          />
        }
        error={errorMessage || ''}
        title={'Collateral Token Address'}
        tooltip={{ id: 'ERC20', description: 'Enter a valid ERC20 address.' }}
      />
      {tokenDetails()}
      <ButtonStyled
        buttonType={ButtonType.primary}
        disabled={!collateralWithAddress}
        onClick={onClickSaveButton}
      >
        Add
      </ButtonStyled>
    </ModalWrapper>
  )
}
