import React, { useState } from 'react'
import { withRouter } from 'react-router'
import { NavLink, RouteComponentProps, matchPath } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'
import styled, { css } from 'styled-components'
import { useWeb3Context } from 'web3-react/dist'

import { Logo } from '../../../../common/constants'
import { ConnectedWeb3 } from '../../../../hooks'
import { ButtonCircle, ButtonConnectWallet, ButtonDisconnectWallet, ButtonRound } from '../../../button'
import { Network } from '../../../common'
import { Dropdown, DropdownItemProps, DropdownPosition } from '../../../common/form/dropdown'
import { XdaiBridgeTransfer } from '../../../market/common/xdai_bridge_transfer'
import { ModalConnectWallet } from '../../../modal'
import { IconAdd, IconClose } from '../../icons'
import { IconArrowRight } from '../../icons/IconArrowRight'
import { DaiIcon } from '../../icons/currencies/DaiIcon'
import { XdaiIcon } from '../../icons/currencies/XdaiIcon'

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

const ButtonCreateDesktop = styled(ButtonRound)`
  display: none;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    display: flex;
  }
`
const ArrowWrapper = styled.div`
  margin-left: 20px;
  margin-right: 20px;
`
const CurrencyWrapper = styled.div`
  display: flex;
  text-align: center;
`
const CurrencyText = styled.div`
  padding-left: 12px;
  font-size: ${props => props.theme.fonts.defaultSize};
  font-family: ${props => props.theme.fonts.fontFamily};
  line-height: 22.41px;
`
const ButtonRoundBridge = styled(ButtonRound)`
  display: flex;

  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    flex-basis: calc(100vw - 20px);
    order: 3;
    margin-right: 12px;
    position: relative;
    left: -95px;
  }
  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    margin-left: 12px;
  }
`

const ButtonCreateMobile = styled(ButtonCircle)`
  display: flex;
  margin-left: auto;

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
  flex-wrap: wrap;
  margin: auto 0 auto auto;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    margin: auto 0 0 auto;
    flex-wrap: unset;
  }
`

const HeaderDropdown = styled(Dropdown)`
  ${ButtonCSS}
`

const CloseIconWrapper = styled.div`
  margin-right: 12px;
`

const HeaderContainer: React.FC<RouteComponentProps> = (props: RouteComponentProps) => {
  const { account, networkId } = useWeb3Context()
  console.log(networkId)

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
  const [isBridgeOpen, setIsBridgeOpen] = useState<boolean>(false)

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
              <ButtonCreateDesktop {...exitButtonProps}>
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
              <ButtonCreateDesktop {...createButtonProps}>Create Market</ButtonCreateDesktop>
              <ButtonCreateMobile {...createButtonProps}>
                <IconAdd />
              </ButtonCreateMobile>
            </>
          )}
          {networkId === 1 && account && (
            <>
              <ButtonRoundBridge
                onClick={() => {
                  setIsBridgeOpen(!isBridgeOpen)
                }}
              >
                <CurrencyWrapper>
                  <DaiIcon size="22" /> <CurrencyText>Dai</CurrencyText>
                </CurrencyWrapper>
                <ArrowWrapper>
                  <IconArrowRight />
                </ArrowWrapper>
                <CurrencyWrapper>
                  <XdaiIcon /> <CurrencyText>xDai</CurrencyText>
                </CurrencyWrapper>
                <XdaiBridgeTransfer open={isBridgeOpen} />
              </ButtonRoundBridge>
            </>
          )}

          {!account && (
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
            {account && (
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
