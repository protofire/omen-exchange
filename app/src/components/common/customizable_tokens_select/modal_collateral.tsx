import React, { useState, HTMLAttributes, ChangeEvent } from 'react'
import styled, { withTheme } from 'styled-components'

import ReactDOM from 'react-dom'
import { FormRow } from '../form_row'
import { Card } from '../card'
import { Textfield } from '../textfield'
import { SubsectionTitle } from '../subsection_title'
import { TitleValue } from '../title_value'
import { ButtonContainer } from '../button_container'
import { Button } from '../button'
import { Token } from '../../../util/types'
import { useCollateral } from '../../../hooks/useCollateral'
import { ConnectedWeb3Context } from '../../../hooks/connectedWeb3'

const Wrapper = styled.div`
  align-items: center;
  background-color: rgb(255, 255, 255, 0.75);
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: center;
  left: 0;
  position: fixed;
  top: 0;
  width: 100vw;
  z-index: 3000;
`

const CollateralAddressWrapper = styled(FormRow)`
  margin-top: 30px;
  margin-bottom: 30px;
  width: 100%;
`

const Grid = styled.div`
  display: grid;
  grid-column-gap: 20px;
  grid-row-gap: 14px;
  grid-template-columns: 1fr 1fr;
  margin-bottom: 25px;
`

const ButtonStyled = styled(Button)`
  margin-right: auto;
`

const ErrorStyled = styled.span`
  color: red;
  font-weight: 500;
  margin-top: 0px;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  theme?: any
  onClose: () => void
  onSave: (collateral: Token) => void
  context: ConnectedWeb3Context
}

const ModalCollateralWrapper = (props: Props) => {
  const { theme, onClose, onSave, context } = props

  const [collateralAddress, setCollateralAddress] = useState<string>('')

  const { collateral, errorMessage } = useCollateral(collateralAddress, context)

  const collateralWithAddress: Maybe<Token> = collateral
    ? { address: collateralAddress, ...collateral }
    : null

  const onClickCloseButton = () => {
    onClose()
  }

  const onClickSaveButton = () => {
    if (collateralWithAddress) {
      onSave(collateralWithAddress)
      onClose()
    }
  }

  const portal: any = document.getElementById('portalContainer')

  const tokenDetails = () => {
    return (
      <>
        <SubsectionTitle>Details</SubsectionTitle>
        <Grid>
          <TitleValue
            title={'Symbol:'}
            value={collateralWithAddress && collateralWithAddress.symbol}
          />
          <TitleValue
            title={'Decimals:'}
            value={collateralWithAddress && collateralWithAddress.decimals}
          />
        </Grid>
      </>
    )
  }

  const messageToRender = (
    <Wrapper>
      <Card>
        <SubsectionTitle>Add a valid collateral token address</SubsectionTitle>
        <CollateralAddressWrapper
          formField={
            <Textfield
              name="collateralAddress"
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                const { value } = event.target
                setCollateralAddress(value)
              }}
              placeholder="Type in a collateral address..."
              type="text"
            />
          }
          title={'Collateral token address'}
          note={<ErrorStyled>{errorMessage || ''}</ErrorStyled>}
        />
        {tokenDetails()}
        <ButtonContainer>
          <ButtonStyled disabled={!collateralWithAddress} onClick={onClickSaveButton}>
            Save
          </ButtonStyled>
          <Button backgroundColor={theme.colors.secondary} onClick={onClickCloseButton}>
            Close
          </Button>
        </ButtonContainer>
      </Card>
    </Wrapper>
  )

  return ReactDOM.createPortal(messageToRender, portal)
}

export const ModalCollateral = withTheme(ModalCollateralWrapper)
