import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React, { useEffect, useRef, useState } from 'react'
import { withRouter } from 'react-router'
import { NavLink, RouteComponentProps, matchPath } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'
import styled, { css } from 'styled-components'

import { Logo } from '../../../../common/constants'
import { useConnectedWeb3Context } from '../../../../hooks'
import { XdaiService } from '../../../../services'
import { formatBigNumber } from '../../../../util/tools'
import { ButtonCircle, ButtonConnectWallet, ButtonDisconnectWallet, ButtonRound } from '../../../button'
import { Network } from '../../../common'
import { Dropdown, DropdownItemProps, DropdownPosition } from '../../../common/form/dropdown'
import { XdaiBridgeTransfer } from '../../../market/common/xdai_bridge_modal'
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
const Bridge = styled.div`
  display: flex;
  flex-direction: column;

  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    width: calc(100% - 20px);
    order: 3;
    margin-top: 100px;
    position: absolute;
    left: 10px;
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
  ${ButtonCSS};
`

const CloseIconWrapper = styled.div`
  margin-right: 12px;
`
const ClaimWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
`
const ClaimAmount = styled.div`
  color: ${props => props.theme.colors.textColorDark};
  font-size: ${props => props.theme.fonts.defaultSize};
`
const GoldDot = styled.div`
  height: 6px;
  width: 6px;
  background-color: ${props => props.theme.colors.gold};
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
`
const ClaimText = styled.div`
  display: flex;
  align-items: center;
`

interface ExtendsHistory extends RouteComponentProps {
  setClaim: React.Dispatch<React.SetStateAction<boolean>>
}

function useOutsideAlerter(ref: any, setState: any) {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        setState(false)
      }
    }

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref])
}

const HeaderContainer: React.FC<ExtendsHistory> = (props: ExtendsHistory) => {
  const { account, library: provider, networkId } = useConnectedWeb3Context()

  const { history, ...restProps } = props
  const [isModalOpen, setModalState] = useState(false)
  const [claimState, setClaimState] = useState<boolean>(false)
  const [unclaimedAmout, setUnclaimedAmount] = useState<BigNumber>(Zero)

  const disableConnectButton = isModalOpen
  const headerDropdownItems: Array<DropdownItemProps> = [
    {
      content: (
        <ClaimWrapper
          onClick={() => {
            props.setClaim(true)
          }}
        >
          <ClaimText>
            <GoldDot />
            Claim
          </ClaimText>
          <ClaimAmount>{formatBigNumber(unclaimedAmout, 18, 2)} DAI</ClaimAmount>
        </ClaimWrapper>
      ),
      visibility: claimState && networkId != 1,
    },

    {
      content: <ButtonDisconnectWallet />,
    },
  ]

  useEffect(() => {
    const fetchUnclaimedAssets = async () => {
      const xDaiService = new XdaiService(provider)
      const transaction = await xDaiService.fetchXdaiTransactionData()
      if (transaction) {
        setUnclaimedAmount(transaction.value)

        setClaimState(true)

        return
      }
      setClaimState(false)
    }
    if (networkId === 1) {
      fetchUnclaimedAssets()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, networkId])

  const isMarketCreatePage = !!matchPath(history.location.pathname, { path: '/create', exact: true })

  const createButtonProps = {
    disabled: disableConnectButton || isMarketCreatePage,
    onClick: () => history.push('/create'),
  }
  const [isBridgeOpen, setIsBridgeOpen] = useState<boolean>(false)
  const ref = useRef(null)
  useOutsideAlerter(ref, setIsBridgeOpen)

  const exitButtonProps = {
    onClick: () => history.push('/'),
  }

  const currencyReturn = (condition: boolean): JSX.Element => {
    return (
      <CurrencyWrapper>
        {condition ? (
          <>
            <DaiIcon size="22" /> <CurrencyText>Dai</CurrencyText>
          </>
        ) : (
          <>
            <XdaiIcon /> <CurrencyText>xDai</CurrencyText>
          </>
        )}
      </CurrencyWrapper>
    )
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

          {(networkId === 1 || networkId == 100) && account && (
            <>
              <Bridge ref={ref}>
                <ButtonRound
                  onClick={() => {
                    setIsBridgeOpen(!isBridgeOpen)
                  }}
                  ref={ref}
                >
                  {currencyReturn(networkId === 1)}
                  <ArrowWrapper>
                    <IconArrowRight />
                  </ArrowWrapper>
                  {currencyReturn(networkId !== 1)}
                </ButtonRound>
                <XdaiBridgeTransfer open={isBridgeOpen} />
              </Bridge>
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
          {account && (
            <>
              <HeaderDropdown
                dropdownPosition={DropdownPosition.center}
                items={headerDropdownItems}
                omitRightButtonMargin={true}
                placeholder={<Network claim={claimState} />}
              />
            </>
          )}
        </ContentsRight>
        <ModalConnectWallet isOpen={isModalOpen} onClose={() => setModalState(false)} />
      </HeaderInner>
    </HeaderWrapper>
  )
}

export const Header = withRouter(HeaderContainer)
