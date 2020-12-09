import React from 'react'
import styled from 'styled-components'

import { ButtonRound } from '../../../button/button_round'

interface Props {
  open: boolean
}

const BridgeWrapper = styled(ButtonRound)<{ isOpen: boolean }>`
  ${props => (!props.isOpen ? 'display:none' : '')};
  position: absolute;
  top: calc(100% + 8px);
  width: 207.27px;
  right: 207.27px;
  z-index: 4321;
  padding: 16px 20px;
  box-shadow: ${props => props.theme.dropdown.dropdownItems.boxShadow};
`
const MainBridgeMenu = styled.div`
  display: flex;
  flex-wrap: wrap;
`
const ChainText = styled.div`
  flex-basis: 50%;
  text-align: start;
`
const BalanceText = styled.div`
  flex-basis: 50%;
  text-align: end;
`

export const XdaiBridgeTransfer: React.FC<Props> = props => {
  console.log(props)
  return (
    <BridgeWrapper isOpen={props.open}>
      <MainBridgeMenu>
        <ChainText>Mainnet</ChainText>
        <BalanceText>1225Dai</BalanceText>
        <ChainText>xDau=i Chain</ChainText>
        <BalanceText>0 xDai</BalanceText>
      </MainBridgeMenu>
    </BridgeWrapper>
  )
}
