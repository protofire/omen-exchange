import React, { useState } from 'react'
import styled from 'styled-components'

import { Tokens } from '../tokens'
import { Button } from '../button'
import { ModalCollateral } from './modal_collateral'
import { Collateral, Token } from '../../../util/types'

interface Props {
  name: string
  onChange: (event: any) => any
  value: Token | Collateral
  networkId: number
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
  const { networkId, name, value, onChange } = props

  const [isModalCollateralOpen, setModalCollateralState] = useState(false)
  const [collateralCustom, setCollateralCustom] = useState<Maybe<Collateral>>(null)

  return (
    <>
      <Wrapper>
        <TokenWrapper>
          <Tokens
            networkId={networkId}
            name={name}
            value={value}
            collateralCustom={collateralCustom}
            onChange={(e: any) => onChange(e)}
          />
        </TokenWrapper>
        <ButtonStyled onClick={() => setModalCollateralState(true)}>+</ButtonStyled>
      </Wrapper>
      {isModalCollateralOpen && (
        <ModalCollateral
          onClose={() => setModalCollateralState(false)}
          onSave={(collateral: Collateral) => {
            setCollateralCustom(collateral)
            onChange({ name: 'collateralId', value: collateral.address })
          }}
        />
      )}
    </>
  )
}
