import React, { useState } from 'react'
import { withRouter } from 'react-router'
import { NavLink, RouteComponentProps } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'
import styled, { css } from 'styled-components'
import { useWeb3Context } from 'web3-react/dist'

import { IS_CORONA_VERSION } from '../../../../common/constants'
import { ConnectedWeb3, useDetectAdblocker, useIsBlacklistedCountry } from '../../../../hooks'
import { Button, ButtonConnectWallet, ButtonDisconnectWallet } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import { CoronaMarketsLogo, Network, OmenLogo } from '../../../common'
import { Message, MessageType } from '../../../common/message'
import { ModalConnectWallet } from '../../../modal'

const HeaderWrapper = styled.div`
  align-items: flex-end;
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
  height: 100%;
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

const LogoWrapper = styled(NavLink)`
  align-items: flex-end;
  display: flex;
  height: 100%;
  max-width: 90px;
  min-width: fit-content;
`

const ButtonCreate = styled(Button)`
  font-size: 12px;
  padding-left: 10px;
  padding-right: 10px;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    font-size: 14px;
    padding-left: 20px;
    padding-right: 20px;
  }
`

const ButtonCSS = css`
  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    margin-left: 12px;

    &:first-child {
      margin-left: 0;
    }
  }
`

const NetworkStyled = styled(Network)`
  margin: 0 0 0 5px;
  ${ButtonCSS}
`

const ButtonConnectWalletStyled = styled(ButtonConnectWallet)`
  margin: 0 0 0 5px;
  ${ButtonCSS}
`

const ButtonDisconnectWalletStyled = styled(ButtonDisconnectWallet)`
  display: none;
  ${ButtonCSS}

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    display: flex;
  }
`

const ButtonWrapper = styled.div`
  ${ButtonCSS}
`

const ContentsRight = styled.div`
  align-items: center;
  display: flex;
  margin: auto 0 0 auto;
`

const HeaderContainer: React.FC<RouteComponentProps> = (props: RouteComponentProps) => {
  const isBlacklistedCountry = useIsBlacklistedCountry()
  const context = useWeb3Context()
  const isAdBlockDetected = useDetectAdblocker()

  const { history, ...restProps } = props
  const [isModalOpen, setModalState] = useState(false)

  const disableConnectButton = IS_CORONA_VERSION && (isBlacklistedCountry === null || isBlacklistedCountry === true)

  const tooltipText =
    isBlacklistedCountry === null
      ? "We couldn't detect your country. Maybe an ad blocker is enabled?"
      : isBlacklistedCountry === true
      ? 'This action is not allowed in your country'
      : ''

  return (
    <HeaderWrapper {...restProps}>
      {isAdBlockDetected && (
        <Message
          text="This dApp may not work correctly with your ad blocker enabled."
          title="Ad Blocker Detected!"
          type={MessageType.error}
        />
      )}
      <HeaderInner>
        <LogoWrapper to="/">{IS_CORONA_VERSION ? <CoronaMarketsLogo /> : <OmenLogo />}</LogoWrapper>
        <ContentsRight>
          {!IS_CORONA_VERSION && (
            <ButtonCreate
              buttonType={ButtonType.secondaryLine}
              disabled={disableConnectButton}
              onClick={() => history.push('/create')}
            >
              Create Market
            </ButtonCreate>
          )}
          {!context.account && (
            <ButtonWrapper
              data-class="customTooltip"
              data-delay-hide="500"
              data-effect="solid"
              data-for="connectButtonTooltip"
              data-multiline={true}
              data-place="left"
              data-tip={tooltipText}
            >
              <ButtonConnectWalletStyled
                disabled={disableConnectButton}
                modalState={isModalOpen}
                onClick={() => {
                  setModalState(true)
                }}
              />
              {disableConnectButton && <ReactTooltip id="connectButtonTooltip" />}
            </ButtonWrapper>
          )}
          <ConnectedWeb3>
            <NetworkStyled />
            <ButtonDisconnectWalletStyled
              callback={() => {
                setModalState(false)
              }}
            />
          </ConnectedWeb3>
        </ContentsRight>
        <ModalConnectWallet isOpen={isModalOpen} onClose={() => setModalState(false)} />
      </HeaderInner>
    </HeaderWrapper>
  )
}

export const Header = withRouter(HeaderContainer)
