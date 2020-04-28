import React, { useState } from 'react'
import { withRouter } from 'react-router'
import { NavLink, RouteComponentProps } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'
import styled, { css } from 'styled-components'
import useLocalStorageState from 'use-local-storage-state'
import { useWeb3Context } from 'web3-react/dist'

import { IS_CORONA_VERSION } from '../../../../common/constants'
import { ConnectedWeb3, useDetectAdblocker, useIsBlacklistedCountry } from '../../../../hooks'
import { Button, ButtonCircle, ButtonConnectWallet, ButtonDisconnectWallet } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import { CoronaMarketsLogo, Network, OmenLogo } from '../../../common'
import { Dropdown, DropdownItemProps, DropdownPosition } from '../../../common/form/dropdown'
import { Message, MessageType } from '../../../common/message'
import { ModalConnectWallet } from '../../../modal'
import { AddIcon } from '../../icons'

const HeaderWrapper = styled.div`
  align-items: flex-end;
  background: ${props => props.theme.header.backgroundColor};
  display: flex;
  flex-grow: 0;
  flex-shrink: 0;
  height: 45px;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 5;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    height: ${props => props.theme.header.height};
  }
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

const ButtonCreateDesktop = styled(Button)`
  display: none;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    display: flex;
  }
`

const ButtonCreateMobile = styled(ButtonCircle)`
  display: flex;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    display: none;
  }
`

const ButtonCSS = css`
  margin: 0 0 0 5px;
  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    margin-left: 12px;

    &:first-child {
      margin-left: 0;
    }
  }
`

const ButtonConnectWalletStyled = styled(ButtonConnectWallet)`
  ${ButtonCSS}
`

const ButtonWrapper = styled.div`
  ${ButtonCSS}
`

const ContentsRight = styled.div`
  align-items: center;
  display: flex;
  margin: auto 0 0 auto;
`

const HeaderDropdown = styled(Dropdown)`
  ${ButtonCSS}
`

const AdBlockWarning: React.FC = () => {
  const adBlockDetected = useDetectAdblocker()
  const [shownBefore, setShownBefore] = useLocalStorageState('adBlockMessageShown', false)

  return adBlockDetected && !shownBefore ? (
    <Message
      onHide={() => setShownBefore(true)}
      text="This dApp may not work correctly with your ad blocker enabled."
      title="Ad Blocker Detected!"
      type={MessageType.error}
    />
  ) : null
}

const HeaderContainer: React.FC<RouteComponentProps> = (props: RouteComponentProps) => {
  const isBlacklistedCountry = useIsBlacklistedCountry()
  const context = useWeb3Context()

  const { history, ...restProps } = props
  const [isModalOpen, setModalState] = useState(false)

  const disableConnectButton =
    (IS_CORONA_VERSION && (isBlacklistedCountry === null || isBlacklistedCountry === true)) || isModalOpen

  const tooltipText =
    isBlacklistedCountry === null
      ? "We couldn't detect your country. Maybe an ad blocker is enabled?"
      : isBlacklistedCountry === true
      ? 'This action is not allowed in your country'
      : ''

  const headerDropdownItems: Array<DropdownItemProps> = [
    {
      content: <ButtonDisconnectWallet />,
    },
  ]

  const createButtonProps = {
    disabled: disableConnectButton,
    onClick: () => history.push('/create'),
  }

  return (
    <HeaderWrapper {...restProps}>
      <AdBlockWarning />
      <HeaderInner>
        <LogoWrapper to="/">{IS_CORONA_VERSION ? <CoronaMarketsLogo /> : <OmenLogo />}</LogoWrapper>
        <ContentsRight>
          {!IS_CORONA_VERSION && (
            <>
              <ButtonCreateDesktop buttonType={ButtonType.secondaryLine} {...createButtonProps}>
                Create Market
              </ButtonCreateDesktop>
              <ButtonCreateMobile {...createButtonProps}>
                <AddIcon />
              </ButtonCreateMobile>
            </>
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
            {context.account && (
              <>
                <HeaderDropdown
                  dropdownPosition={DropdownPosition.right}
                  items={headerDropdownItems}
                  placeholder={<Network />}
                />
              </>
            )}
          </ConnectedWeb3>
        </ContentsRight>
        <ModalConnectWallet isOpen={isModalOpen} onClose={() => setModalState(false)} />
      </HeaderInner>
    </HeaderWrapper>
  )
}

export const Header = withRouter(HeaderContainer)
