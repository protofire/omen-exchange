import React from 'react'
import styled from 'styled-components'
import { useWeb3Context } from 'web3-react/dist'

import { useConnectedWeb3Context } from '../../../hooks'
import { networkIds } from '../../../util/networks'
import { truncateStringInTheMiddle } from '../../../util/tools'
import { IconMetaMask, IconWalletConnect } from '../../common/icons'
import { IconJazz } from '../icons/IconJazz'
import { IconNotification } from '../icons/IconNotification'

interface Props {
  claim: boolean
  account?: any
  networkId?: any
}

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`
const ConnectorCircle = styled.div`
  height: 17px;
  width: 17px;
  border-radius: 50%;
  border: ${props => props.theme.borders.borderLineDisabled};
  background: #fff;
  z-index: 2;
  position: absolute;
  top: 5px;
  bottom: 0;
  right: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
`
const ConnectionIconWrapper = styled.div`
  height: 28px;
  width: 28px;
  position: relative;
`

const ConnectionStatusText = styled.span`
  color: ${props => props.theme.header.color};
  font-size: 12px;
  font-weight: 400;
  line-height: 1.2;
  margin-right: 12px;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    font-size: 14px;
  }
`

export const Network = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { account, networkId } = context
  const connectorIcon =
    context.rawWeb3Context.connectorName === 'MetaMask' ? (
      <IconMetaMask />
    ) : context.rawWeb3Context.connectorName === 'WalletConnect' ? (
      <IconWalletConnect />
    ) : (
      <></>
    )
  if (!account) {
    return null
  }
  return (
    <Wrapper {...props}>
      {props.claim && networkId === networkIds.MAINNET && <IconNotification style={{ marginRight: 12 }} />}
      <ConnectionStatusText>{truncateStringInTheMiddle(account, 5, 3) || 'No account connected'}</ConnectionStatusText>
      <ConnectionIconWrapper>
        <ConnectorCircle>{connectorIcon}</ConnectorCircle>
        <IconJazz account={account} size={22} />
      </ConnectionIconWrapper>
    </Wrapper>
  )
}
