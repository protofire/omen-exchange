import React, { useState } from 'react'
import styled from 'styled-components'

import { Tokens } from '../tokens'
import { Button } from '../button'
import { ModalCollateral } from './modal_collateral'
import { Token } from '../../../util/types'
import { ConnectedWeb3Context } from '../../../hooks/connectedWeb3'

interface Props {
  name: string
  onCollateralChange: (token: Token) => void
  value: Token
  customValues: Token[]
  addCustomValue: (collateral: Token) => void
  context: ConnectedWeb3Context
}

const Wrapper = styled.div``
const TokenWrapper = styled.div`
  display: inline-block;
  width: 90%;
`

const ButtonStyled = styled(Button)`
  display: inline-flex;
  padding: 0 13px;
  width: 25px;
  height: 25px;
  margin-left: 10px;
`

export const TokensAddAnotherCustom = (props: Props) => {
  const { context, name, value, customValues, onCollateralChange, addCustomValue } = props

  const [isModalCollateralOpen, setModalCollateralState] = useState(false)

  return (
    <>
      <Wrapper>
        <TokenWrapper>
          <Tokens
            networkId={context.networkId}
            name={name}
            value={value}
            customValues={customValues}
            onTokenChange={onCollateralChange}
          />
        </TokenWrapper>
        <ButtonStyled onClick={() => setModalCollateralState(true)}>+</ButtonStyled>
      </Wrapper>
      {isModalCollateralOpen && (
        <ModalCollateral
          context={context}
          onClose={() => setModalCollateralState(false)}
          onSave={(collateral: Token) => {
            addCustomValue(collateral)
            onCollateralChange(collateral)
          }}
        />
      )}
    </>
  )
}
