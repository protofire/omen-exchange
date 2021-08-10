import { BigNumber, parseUnits } from 'ethers/utils'
import React from 'react'
import styled from 'styled-components'

import { useConnectedWeb3Context } from '../../../contexts'
import { bigNumberToString, getInitialCollateral } from '../../../util/tools'
import { Token } from '../../../util/types'
import { TitleValue } from '../../common'
import { ValueStates } from '../common_sections/user_transactions_tokens/transaction_details_row'

const UserDataTitleValue = styled(TitleValue)`
  color: ${props => props.theme.textfield.color};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.textfield.paddingVertical};
`

const PoolOverview = styled.div`
  margin-top: 24px;
  margin-right: auto;
  font-weight: ${props => props.theme.textfield.fontWeight}
  line-height: ${props => props.theme.fonts.defaultLineHeight}
 
`

const LiquidityRewards = styled.div`
  margin-top: 24px;
  margin-right: auto;
  margin-left: 53px;
  font-weight: ${props => props.theme.textfield.fontWeight}
  line-height: ${props => props.theme.fonts.defaultLineHeight}
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
  color: ${props => props.theme.header.color}
  display: flex;
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
    symbol,
    totalEarnings,
    totalPoolShares,
    totalRewards,
    totalUserLiquidity,
    userEarnings,
  } = props
  const context = useConnectedWeb3Context()
  const { networkId } = context

  const baseCollateral = getInitialCollateral(networkId, collateral)

  return (
    <>
      <HeaderWrapper>
        <Border />
        <MarketInfoHeader>
          <PoolOverview>Pool Overview</PoolOverview>
          {currentApr > 0 && <LiquidityRewards>Liquidity Rewards</LiquidityRewards>}
        </MarketInfoHeader>
      </HeaderWrapper>

      <SpaceBetween>
        <FlexBoxColumnOrRow currentApr={currentApr > 0}>
          <UserDataWrapper>
            <UserDataTitleValue
              title={currentApr > 0 ? 'Total Liquidity' : 'Your Liquidity'}
              value={`${bigNumberToString(
                currentApr > 0 ? totalPoolShares : totalUserLiquidity,
                baseCollateral.decimals,
              )} ${baseCollateral.symbol}`}
            />
            <UserDataTitleValue
              title={currentApr > 0 ? 'Total Earnings' : 'Total Liquidity'}
              value={`${
                currentApr > 0 && totalEarnings.gt(parseUnits('0.01', baseCollateral.decimals)) ? '+' : ''
              }${bigNumberToString(currentApr > 0 ? totalEarnings : totalPoolShares, baseCollateral.decimals)} ${
                baseCollateral.symbol
              }`}
            />
          </UserDataWrapper>
          <UserDataWrapper style={currentApr > 0 ? { marginLeft: '0px' } : { marginLeft: '32px' }}>
            <UserDataTitleValue
              title={currentApr > 0 ? 'Your Liquidity' : 'Total Earnings'}
              value={`${
                currentApr == 0 && totalEarnings.gt(parseUnits('0.01', baseCollateral.decimals)) ? '+' : ''
              }${bigNumberToString(currentApr > 0 ? totalUserLiquidity : totalEarnings, baseCollateral.decimals)} ${
                baseCollateral.symbol
              }`}
            />

            <UserDataTitleValue
              state={userEarnings.gt(0) ? ValueStates.success : undefined}
              title="Your Earnings"
              value={`${userEarnings.gt(parseUnits('0.01', baseCollateral.decimals)) ? '+' : ''}${bigNumberToString(
                userEarnings,
                baseCollateral.decimals,
              )} ${baseCollateral.symbol}`}
            />
          </UserDataWrapper>
        </FlexBoxColumnOrRow>
        {currentApr > 0 && (
          <LpRewardsWrapper>
            <UserDataTitleValue title="Current APR" value={`${currentApr.toFixed(2)}%`} />
            <UserDataTitleValue title="Total Rewards" value={`${totalRewards.toFixed(2)} OMN`} />
            <UserDataTitleValue title="Rewards left" value={`${remainingRewards.toFixed(2)} OMN`} />

            <UserDataTitleValue
              state={earnedRewards > 0 ? ValueStates.success : undefined}
              title="Your Rewards"
              value={`${earnedRewards.toFixed(2)} OMN`}
            />
          </LpRewardsWrapper>
        )}
      </SpaceBetween>
    </>
  )
}
