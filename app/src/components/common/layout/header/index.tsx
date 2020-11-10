import React, { useState } from 'react'
import { withRouter } from 'react-router'
import { NavLink, RouteComponentProps, matchPath } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'
import styled, { css } from 'styled-components'
import { useWeb3Context } from 'web3-react/dist'

import { Logo } from '../../../../common/constants'
import { ConnectedWeb3 } from '../../../../hooks'
import { Button, ButtonCircle, ButtonConnectWallet, ButtonDisconnectWallet } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import { Network } from '../../../common'
import { Dropdown, DropdownItemProps, DropdownPosition } from '../../../common/form/dropdown'
import { ModalConnectWallet } from '../../../modal'
import { IconAdd, IconClose } from '../../icons'

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
  max-width: 90px;
  min-width: fit-content;
`

const ButtonCreateDesktop = styled(Button)`
  display: none;
  height: 40px;
  border-radius: 8px;

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
  height: 40px;
  border-radius: 8px;
`

const ButtonWrapper = styled.div`
  ${ButtonCSS}
`

const ContentsLeft = styled.div`
  align-items: center;
  display: flex;
  margin: auto auto auto 0;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    margin: auto auto 0 0;
  }
`

const ContentsRight = styled.div`
  align-items: center;
  display: flex;
  margin: auto 0 auto auto;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    margin: auto 0 0 auto;
  }
`

const HeaderDropdown = styled(Dropdown)`
  ${ButtonCSS}
`

const CloseIconWrapper = styled.div`
  margin-right: 12px;
`

const HeaderContainer: React.FC<RouteComponentProps> = (props: RouteComponentProps) => {
  const context = useWeb3Context()

  const { history, ...restProps } = props
  const [isModalOpen, setModalState] = useState(false)

  const disableConnectButton = isModalOpen

  const headerDropdownItems: Array<DropdownItemProps> = [
    {
      content: <ButtonDisconnectWallet />,
    },
  ]

  const isMarketCreatePage = !!matchPath(history.location.pathname, { path: '/create', exact: true })

  const createButtonProps = {
    disabled: disableConnectButton || isMarketCreatePage,
    onClick: () => history.push('/create'),
  }

  const exitButtonProps = {
    onClick: () => history.push('/'),
  }

  return (
    <HeaderWrapper {...restProps}>
      <HeaderInner>
        <ContentsLeft>
          <LogoWrapper to="/">
            <Logo />
          </LogoWrapper>
        </ContentsLeft>
        <ContentsRight>
          {isMarketCreatePage ? (
            <>
              <ButtonCreateDesktop buttonType={ButtonType.secondaryLine} {...exitButtonProps}>
                <CloseIconWrapper>
                  <IconClose />
                </CloseIconWrapper>

                <span>Exit</span>
              </ButtonCreateDesktop>
              <ButtonCreateMobile {...exitButtonProps}>
                <IconClose />
              </ButtonCreateMobile>
            </>
          ) : (
            <>
              <ButtonCreateDesktop buttonType={ButtonType.secondaryLine} {...createButtonProps}>
                Create Market
              </ButtonCreateDesktop>
              <ButtonCreateMobile {...createButtonProps}>
                <IconAdd />
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
                  dropdownPosition={DropdownPosition.center}
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
