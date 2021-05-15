import { BigNumber } from 'ethers/utils'
import React from 'react'
import styled from 'styled-components'

import { useCompoundService, useConnectedWeb3Context } from '../../../../hooks'
import { formatBigNumber, formatNumber, getInitialCollateral } from '../../../../util/tools'
import { CompoundTokenType, Token } from '../../../../util/types'
import { TitleValue } from '../../../common'
import { ValueStates } from '../../common/transaction_details_row'

const UserDataTitleValue = styled(TitleValue)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0px;
  margin-bottom: ${props => props.theme.textfield.paddingVertical};
  width: auto;
  
  }
`

const PoolOverview = styled.div`
  margin-top: 20px;
  margin-right: auto;
  font-weight: ${props => props.theme.textfield.fontWeight}
  line-height: ${props => props.theme.fonts.defaultLineHeight}
  display: flex;
  flex-direction: row;
  border: 2px solid red;
`

const LiquidityRewards = styled.div`
  margin-top: 24px;
  margin-right: auto;
  margin-left: 51px;
  font-family: Roboto;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 16px;
  display: flex;
  align-items: center;
  flex-direction: row;
`

const Border = styled.div`
  position: absolute;
  left: 0px;
  right: 0px;
  border-top: ${({ theme }) => theme.borders.borderLineDisabled};
`

const FlexBoxColumnOrRow = styled.div<{ currentApr?: boolean }>`
  display: flex;
  width: ${props => (!props.currentApr ? '100%' : '50%')}
  flex-direction: ${props => (!props.currentApr ? 'row' : 'column')};
  justify-content: space-between;
`

const MarketInfoHeader = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 16px;
  justify-content: space-between;
`

const UserDataWrapper = styled.div<{ currentApr?: boolean }>`
  width: 100%;
`

const LpRewardsWrapper = styled.div`
  width: 50%;
  margin-left: 32px;
`
const SpaceBetween = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
`

const HeaderWrapper = styled.div``

interface Props {
  totalUserLiquidity: BigNumber
  collateral: Token
  totalPoolShares: BigNumber
  symbol: string
  userEarnings: BigNumber
  totalEarnings: BigNumber
  currentApr: number
  remainingRewards: number
  earnedRewards: number
  totalRewards: number
}

export const UserPoolData: React.FC<Props> = (props: Props) => {
  const {
    collateral,
    currentApr,
    earnedRewards,
    remainingRewards,
    totalEarnings,
    totalPoolShares,
    totalRewards,
    totalUserLiquidity,
    userEarnings,
  } = props
  const context = useConnectedWeb3Context()
  const { networkId } = context
  const baseCollateral = getInitialCollateral(networkId, collateral)
  let displayUserLiquidity = totalUserLiquidity
  let displayPoolTokens = totalPoolShares
  let displayUserEarnings = userEarnings
  let displayTotalEarnings = totalEarnings
  const { compoundService: CompoundService } = useCompoundService(collateral, context)
  const compoundService = CompoundService || null
  if (collateral.symbol.toLowerCase() in CompoundTokenType && compoundService) {
    displayUserLiquidity = compoundService.calculateCTokenToBaseExchange(baseCollateral, totalUserLiquidity)
    displayPoolTokens = compoundService.calculateCTokenToBaseExchange(baseCollateral, totalPoolShares)
    displayUserEarnings = compoundService.calculateCTokenToBaseExchange(baseCollateral, userEarnings)
    displayTotalEarnings = compoundService.calculateCTokenToBaseExchange(baseCollateral, totalEarnings)
  }

  return (
    <>
      <HeaderWrapper>
        <Border />
        <MarketInfoHeader>
          <PoolOverview>Pool Overview</PoolOverview>
          {currentApr == 0 && <LiquidityRewards>Liquidity Rewards</LiquidityRewards>}
        </MarketInfoHeader>
      </HeaderWrapper>

      <SpaceBetween>
        <FlexBoxColumnOrRow currentApr={false}>
          <UserDataWrapper>
            <UserDataTitleValue
              title={currentApr > 0 ? 'Total Liquidity' : 'Your Liquidity'}
              value={`${formatNumber(
                formatBigNumber(displayPoolTokens, baseCollateral.decimals, baseCollateral.decimals),
              )}`}
            />
            <UserDataTitleValue
              state={displayTotalEarnings.gt(0) ? ValueStates.success : undefined}
              title={currentApr > 0 ? 'Total Earnings' : 'Total Liquidity'}
              value={`${displayTotalEarnings.gt(0) ? '+' : ''}${formatNumber(
                formatBigNumber(displayTotalEarnings, baseCollateral.decimals, baseCollateral.decimals),
              )} ${baseCollateral.symbol}`}
            />
          </UserDataWrapper>
          <UserDataWrapper style={currentApr > 0 ? { marginLeft: '0px' } : { marginLeft: '32px' }}>
            <UserDataTitleValue
              state={displayTotalEarnings.gt(0) && !(currentApr > 0) ? ValueStates.success : undefined}
              title={currentApr > 0 ? 'Your Liquidity' : 'Total Earnings'}
              value={`${formatNumber(
                formatBigNumber(displayUserLiquidity, baseCollateral.decimals, baseCollateral.decimals),
              )} ${baseCollateral.symbol}`}
            />

            <UserDataTitleValue
              state={userEarnings.gt(0) ? ValueStates.success : undefined}
              title="Your Earnings"
              value={`${displayUserEarnings.gt(0) ? '+' : ''}${formatNumber(
                formatBigNumber(displayUserEarnings, baseCollateral.decimals, baseCollateral.decimals),
              )} ${baseCollateral.symbol}`}
            />
          </UserDataWrapper>
        </FlexBoxColumnOrRow>
        {currentApr > 0 && (
          <LpRewardsWrapper>
            <UserDataTitleValue
              state={totalRewards > 0 ? ValueStates.success : undefined}
              title="Total Rewards"
              value={`${formatNumber(totalRewards.toString())} OMN`}
            />
            <UserDataTitleValue
              state={remainingRewards > 0 ? ValueStates.success : undefined}
              title="Rewards left"
              value={`${formatNumber(remainingRewards.toString())} OMN`}
            />
            <UserDataTitleValue
              state={currentApr > 0 ? ValueStates.success : undefined}
              title="Current APY"
              value={`${formatNumber(currentApr.toString())}%`}
            />

            <UserDataTitleValue
              state={earnedRewards > 0 ? ValueStates.success : undefined}
              title="Your Rewards"
              value={`${formatNumber(earnedRewards.toString())} OMN`}
            />
          </LpRewardsWrapper>
        )}
      </SpaceBetween>
    </>
  )
}
