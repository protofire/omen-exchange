import React, { useState, HTMLAttributes, useEffect, ChangeEvent } from 'react'
import { useWeb3Context } from 'web3-react'
import styled, { withTheme } from 'styled-components'

import { getLogger } from '../../../util/logger'
import ReactDOM from 'react-dom'
import { FormRow } from '../form_row'
import { Card } from '../card'
import { Textfield } from '../textfield'
import { SubsectionTitle } from '../subsection_title'
import { TitleValue } from '../title_value'
import { ButtonContainer } from '../button_container'
import { Button } from '../button'
import { ERC20Service } from '../../../services'
import { Collateral } from '../../../util/types'

const logger = getLogger('ModalConnectWallet::Index')

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

interface Props extends HTMLAttributes<HTMLDivElement> {
  theme?: any
  onClose: () => void
  onSave: (collateral: Collateral) => void
}

const ModalCollateralWrapper = (props: Props) => {
  const context = useWeb3Context()

  if (context.error) {
    logger.error('Error in web3 context', context.error)
  }

  const { theme, onClose, onSave } = props

  const [collateralAddress, setCollateralAddress] = useState<string>('')
  const [collateral, setCollateral] = useState<Maybe<Collateral>>(null)
  const [collateralError, setCollateralError] = useState<boolean>(false)

  useEffect(() => {
    let isSubscribed = true

    const fetchIsValidErc20 = async () => {
      const erc20Service = new ERC20Service(context.library, collateralAddress)
      const isValidErc20 = await erc20Service.isValidErc20()
      if (isSubscribed) {
        setCollateralError(!isValidErc20)
        setCollateral(null)
      }

      if (isSubscribed && isValidErc20) {
        const data = await erc20Service.getProfileSummary()
        setCollateral({
          address: collateralAddress,
          ...data,
        } as Collateral)
      }
    }

    fetchIsValidErc20()

    return () => {
      isSubscribed = false
    }
  }, [context, collateralAddress])

  const onClickCloseButton = () => {
    onClose()
  }

  const onClickSaveButton = () => {
    if (collateral) {
      onSave(collateral)
      onClose()
    }
  }

  const portal: any = document.getElementById('portalContainer')

  const tokenDetails = () => {
    return (
      <>
        <SubsectionTitle>Details</SubsectionTitle>
        <Grid>
          <TitleValue title={'Name:'} value={collateral && collateral.name} />
          <TitleValue title={'Symbol:'} value={collateral && collateral.symbol} />
          <TitleValue title={'Decimals:'} value={collateral && collateral.decimals} />
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
        />
        {tokenDetails()}
        <ButtonContainer>
          <ButtonStyled disabled={collateralError} onClick={onClickSaveButton}>
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
