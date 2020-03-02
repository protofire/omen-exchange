import React, { useState } from 'react'
import { withRouter } from 'react-router'
import { NavLink, RouteComponentProps } from 'react-router-dom'
import styled from 'styled-components'
import { useWeb3Context } from 'web3-react/dist'

import { ConnectedWeb3 } from '../../../hooks/connectedWeb3'
import { ButtonConnectWallet } from '../button_connect_wallet'
import { ButtonDisconnectWallet } from '../button_disconnect_wallet'
import { Logo } from '../logo'
import { ModalConnectWallet } from '../modal_connect_wallet'
import { Network } from '../network'

const HeaderWrapper = styled.div`
  background: ${props => props.theme.header.backgroundColor};
  display: flex;
  flex-grow: 0;
  flex-shrink: 0;
  height: ${props => props.theme.header.height};
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 5;
`

const HeaderInner = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 100%;
  padding: 0 10px;
  position: relative;
  width: ${props => props.theme.themeBreakPoints.xxl};

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    padding: 0 ${props => props.theme.paddings.mainPadding};
  }
`

const NetworkStyled = styled(Network)`
  margin: 0 0 0 auto;

  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    background-color: #fefefe;
    border-bottom: 1px solid ${props => props.theme.borders.borderColor};
    height: 23px;
    justify-content: flex-end;
    left: 0;
    padding: 0 10px;
    position: absolute;
    top: calc(100% + 1px);
    width: 100%;
  }
`

const ButtonDisconnectWalletStyled = styled(ButtonDisconnectWallet)`
  margin: 0 0 0 25px;
`

const ButtonConnectWalletStyled = styled(ButtonConnectWallet)`
  margin: 0 0 0 auto;
`

const LogoWrapper = styled(NavLink)``

const HeaderContainer: React.FC<RouteComponentProps> = (props: RouteComponentProps) => {
  const context = useWeb3Context()

  const { ...restProps } = props
  const [isModalOpen, setModalState] = useState(false)

  return (
    <HeaderWrapper {...restProps}>
      <HeaderInner>
        <LogoWrapper to="/">
          <Logo />
        </LogoWrapper>
        <ConnectedWeb3>
          <NetworkStyled />
          <ButtonDisconnectWalletStyled
            callback={() => {
              setModalState(false)
            }}
          />
        </ConnectedWeb3>
        {!context.account && (
          <ButtonConnectWalletStyled
            modalState={isModalOpen}
            onClick={() => {
              setModalState(true)
            }}
          />
        )}
        <ModalConnectWallet isOpen={isModalOpen} onClose={() => setModalState(false)} />
      </HeaderInner>
    </HeaderWrapper>
  )
}

export const Header = withRouter(HeaderContainer)
