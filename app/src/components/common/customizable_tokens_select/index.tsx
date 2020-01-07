import React, { useState } from 'react'
import styled from 'styled-components'

import { Tokens } from '../tokens'
import { ModalCollateral } from './modal_collateral'
import { Token } from '../../../util/types'
import { ConnectedWeb3Context } from '../../../hooks/connectedWeb3'
import { FormRowLink } from '../form_row_link'

interface Props {
  name: string
  onCollateralChange: (token: Token) => void
  value: Token
  customValues: Token[]
  addCustomValue: (collateral: Token) => void
  context: ConnectedWeb3Context
}

const Link = styled(FormRowLink)`
  display: block;
  margin-top: 5px;
  margin-left: auto;
`

export const CustomizableTokensSelect = (props: Props) => {
  const { context, name, value, customValues, onCollateralChange, addCustomValue } = props

  const [isModalCollateralOpen, setModalCollateralState] = useState(false)

  return (
    <>
      <Tokens
        customValues={customValues}
        name={name}
        networkId={context.networkId}
        onTokenChange={onCollateralChange}
        value={value}
      />
      <Link onClick={() => setModalCollateralState(true)}>Add token</Link>
      <ModalCollateral
        context={context}
        isOpen={isModalCollateralOpen}
        onClose={() => setModalCollateralState(false)}
        onSave={(collateral: Token) => {
          addCustomValue(collateral)
          onCollateralChange(collateral)
        }}
      />
    </>
  )
}
