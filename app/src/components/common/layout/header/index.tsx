import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React, { useEffect, useState } from 'react'
import { withRouter } from 'react-router'
import { NavLink, RouteComponentProps, matchPath } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'
import styled, { css } from 'styled-components'

import { Logo } from '../../../../common/constants'
import { useCollateralBalance, useConnectedWeb3Context, useTokens } from '../../../../hooks'
import { XdaiService } from '../../../../services'
import { getNativeAsset, networkIds } from '../../../../util/networks'
import { formatBigNumber, formatNumber } from '../../../../util/tools'
import { ExchangeType } from '../../../../util/types'
import { Button, ButtonCircle, ButtonConnectWallet, ButtonRound } from '../../../button'
import { Network } from '../../../common'
import { Dropdown, DropdownItemProps, DropdownPosition } from '../../../common/form/dropdown'
import { ModalConnectWalletWrapper, ModalDepositWithdrawWrapper, ModalYourConnectionWrapper } from '../../../modal'
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

const ButtonCreateDesktop = styled(ButtonRound)`
  display: none;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    display: flex;
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
  padding: 12px 14px;
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

const HeaderButton = styled(Button)`
  ${ButtonCSS};
`

const DepositedBalance = styled.p`
  font-size: ${props => props.theme.fonts.defaultSize};
  color: ${props => props.theme.colors.textColorLighter};
`

const HeaderButtonDivider = styled.div`
  height: 16px;
  width: 1px;
  margin: 0 12px;
  background: ${props => props.theme.borders.borderDisabled};
`

const CloseIconWrapper = styled.div`
  margin-right: 12px;
`

const DropdownWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
`

const Dot = styled.div<{ color: string; size: number }>`
  height: ${props => props.size}px;
  width: ${props => props.size}px;
  background-color: ${props => props.theme.colors[props.color]};
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
`

const DropdownText = styled.div`
  display: flex;
  align-items: center;
`

const HeaderDropdown = styled(Dropdown)`
  ${ButtonCSS};
  height: 40px;
`

interface ExtendsHistory extends RouteComponentProps {
  setClaim: React.Dispatch<React.SetStateAction<boolean>>
}

const HeaderContainer: React.FC<ExtendsHistory> = (props: ExtendsHistory) => {
  const context = useConnectedWeb3Context()
  const { relay, toggleRelay } = context
  const { account, active, connectorName, error, networkId } = context.rawWeb3Context

  const { history, ...restProps } = props
  const [isConnectWalletModalOpen, setConnectWalletModalState] = useState(false)
  const [isYourConnectionModalOpen, setYourConnectionModalState] = useState(false)
  const [isDepositWithdrawModalOpen, setDepositWithdrawModalState] = useState(false)
  const [depositWithdrawType, setDepositWithdrawType] = useState<ExchangeType>(ExchangeType.deposit)

  const [claimState, setClaimState] = useState<boolean>(false)
  const [unclaimedAmount, setUnclaimedAmount] = useState<BigNumber>(Zero)

  const { refetch, tokens } = useTokens(context.rawWeb3Context, true, true)

  const ethBalance = new BigNumber(
    tokens.filter(token => token.symbol === 'ETH' || token.symbol === 'xDAI')[0]?.balance || '',
  )
  const formattedEthBalance = formatNumber(formatBigNumber(ethBalance, 18, 18))
  const daiBalance = new BigNumber(tokens.filter(token => token.symbol === 'DAI')[0]?.balance || '')
  const formattedDaiBalance = formatNumber(formatBigNumber(daiBalance, 18, 18))

  const nativeAsset = getNativeAsset(context.networkId)
  const { collateralBalance: xDaiBalance, fetchCollateralBalance } = useCollateralBalance(
    getNativeAsset(context.networkId),
    context,
  )
  const formattedxDaiBalance = `${formatBigNumber(xDaiBalance || Zero, nativeAsset.decimals, 2)}`

  const fetchUnclaimedAssets = async () => {
    if (account) {
      const xDaiService = new XdaiService(context.library)
      const transaction = await xDaiService.fetchXdaiTransactionData()
      if (transaction) {
        setUnclaimedAmount(transaction.value)
        setClaimState(true)
        return
      }
      setUnclaimedAmount(Zero)
      setClaimState(false)
    }
  }

  const fetchBalances = () => {
    fetchUnclaimedAssets()
    fetchCollateralBalance()
    refetch()
  }

  useEffect(() => {
    if (relay) {
      fetchBalances()
    } else {
      setUnclaimedAmount(Zero)
      setClaimState(false)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, networkId])

  const disableConnectButton = isConnectWalletModalOpen

  const networkPlacholder = (
    <DropdownWrapper>
      <DropdownText>
        <Dot color="greenLight" size={8} />
        {relay ? 'xDai' : 'Mainnet'}
      </DropdownText>
    </DropdownWrapper>
  )
  const networkDropdownItems: Array<DropdownItemProps> = [
    {
      content: (
        <DropdownWrapper
          onClick={() => {
            toggleRelay()
          }}
        >
          <DropdownText>{relay ? 'Mainnet' : 'xDai'}</DropdownText>
        </DropdownWrapper>
      ),
    },
  ]

  const logout = () => {
    if (active || (error && connectorName)) {
      localStorage.removeItem('CONNECTOR')
      context.rawWeb3Context.setConnector('Infura')
    }
  }

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

          {(networkId === networkIds.MAINNET || relay) && (
            <HeaderDropdown
              currentItem={networkDropdownItems.length + 1}
              dropdownPosition={DropdownPosition.center}
              items={networkDropdownItems}
              minWidth={false}
              placeholder={networkPlacholder}
            />
          )}

          {!account && (
            <ButtonConnectWalletStyled
              disabled={disableConnectButton}
              modalState={isConnectWalletModalOpen}
              onClick={() => {
                setConnectWalletModalState(true)
              }}
            />
          )}
          {disableConnectButton && <ReactTooltip id="connectButtonTooltip" />}

          {account && (
            <HeaderButton
              onClick={() => {
                setYourConnectionModalState(true)
              }}
            >
              {relay && (
                <>
                  <DepositedBalance>{formattedxDaiBalance} DAI</DepositedBalance>
                  <HeaderButtonDivider />
                </>
              )}
              <Network claim={false} />
            </HeaderButton>
          )}
        </ContentsRight>
        <ModalYourConnectionWrapper
          changeWallet={() => {
            setYourConnectionModalState(false)
            logout()
            setConnectWalletModalState(true)
          }}
          claimState={claimState}
          fetchBalances={fetchBalances}
          formattedDaiBalance={formattedDaiBalance}
          formattedEthBalance={formattedEthBalance}
          formattedxDaiBalance={formattedxDaiBalance}
          isOpen={isYourConnectionModalOpen}
          onClose={() => setYourConnectionModalState(false)}
          openDepositModal={() => {
            setYourConnectionModalState(false)
            setDepositWithdrawType(ExchangeType.deposit)
            setDepositWithdrawModalState(true)
          }}
          openWithdrawModal={() => {
            setYourConnectionModalState(false)
            setDepositWithdrawType(ExchangeType.withdraw)
            setDepositWithdrawModalState(true)
          }}
          unclaimedAmount={unclaimedAmount}
        />
        <ModalConnectWalletWrapper
          isOpen={isConnectWalletModalOpen}
          onClose={() => setConnectWalletModalState(false)}
        />
        <ModalDepositWithdrawWrapper
          daiBalance={daiBalance}
          exchangeType={depositWithdrawType}
          fetchBalances={fetchBalances}
          formattedDaiBalance={formattedDaiBalance}
          formattedxDaiBalance={formattedxDaiBalance}
          isOpen={isDepositWithdrawModalOpen}
          onBack={() => {
            setDepositWithdrawModalState(false)
            setYourConnectionModalState(true)
          }}
          onClose={() => setDepositWithdrawModalState(false)}
          xDaiBalance={xDaiBalance}
        />
      </HeaderInner>
    </HeaderWrapper>
  )
}

export const Header = withRouter(HeaderContainer)
