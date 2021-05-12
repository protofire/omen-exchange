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
  padding: 0px;

  position: static;
  width: 253px;
  height: 16px;
  left: 0px;
  top: 0px;
  flex: 0 calc(50% - 16px);

  &:nth-child(odd) {
    margin-right: 32px;
  }
  &:nth-child(-n + 6) {
    margin-bottom: 12px;
  }

  @media (max-width: ${props => props.theme.themeBreakPoints.sm}) {
    flex: 0 50%;

    margin-right: 0 !important;
    margin-bottom: 0 !important;

    &:not(:first-child) {
      margin-top: 12px;
    }
    &:nth-child(2) {
      order: 2;
    }
    &:nth-child(3) {
      order: 1;
    }
    &:nth-child(4) {
      order: 3;
    }
  }
`

const UserDataWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin: 0 -25px;
  <<<<<<<headpadding: 24px;
  =======padding: 20px 24px;

  @media (max-width: ${props => props.theme.themeBreakPoints.sm}) {
    flex-wrap: nowrap;
    flex-direction: column;
  }
`
// ^^
//border-top: ${({ theme }) => theme.borders.borderLineDisabled};

const ContentsLeft = styled.div`
  align-items: center;
  display: flex;
  margin: auto auto auto 0;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    margin: auto auto 0 0;
  }
`

const TestDiv = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin: 0 -25px;
  padding: 20px 20px 5px 24px;
  >>>>>>>5c05eb5ac9dfcc038c134e01699a52660e4e73ddborder-top: ${({ theme }) => theme.borders.borderLineDisabled};
  @media (max-width: ${props => props.theme.themeBreakPoints.sm}) {
    flex-wrap: nowrap;
    flex-direction: column;
  }
`

const UserDataColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  width: 253px;
  height: 44px;
  margin: 0px;
`
const ColumnWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0px;

  position: static;
  width: 538px;
  height: 44px;
  left: 0px;
  top: 32px;
`

const PoolOverview = styled.div`
  font-family: Roboto;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 16px;
  display: flex;
  align-items: center;
`
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
  {
    console.log('total user liquidity' + totalUserLiquidity)
  }
  return (
    <UserDataWrapper>
      <PoolOverview>Pool Overview</PoolOverview>
      <ColumnWrapper>
        <UserDataColumn>
          <UserDataTitleValue
            title="Your Liquidity"
            value={`${formatNumber(
              formatBigNumber(displayUserLiquidity, baseCollateral.decimals, baseCollateral.decimals),
            )} ${baseCollateral.symbol}`}
          />
          <UserDataTitleValue
            title="Total Liquidity"
            value={`${formatNumber(
              formatBigNumber(displayPoolTokens, baseCollateral.decimals, baseCollateral.decimals),
            )}`}
          />
        </UserDataColumn>
        <UserDataColumn>
          <UserDataTitleValue
            state={userEarnings.gt(0) ? ValueStates.success : undefined}
            title="Your Earnings"
            value={`${displayUserEarnings.gt(0) ? '+' : ''}${formatNumber(
              formatBigNumber(displayUserEarnings, baseCollateral.decimals, baseCollateral.decimals),
            )} ${baseCollateral.symbol}`}
          />
          <UserDataTitleValue
            state={displayTotalEarnings.gt(0) ? ValueStates.success : undefined}
            title="Total Earnings"
            value={`${displayTotalEarnings.gt(0) ? '+' : ''}${formatNumber(
              formatBigNumber(displayTotalEarnings, baseCollateral.decimals, baseCollateral.decimals),
            )} ${baseCollateral.symbol}`}
          />
        </UserDataColumn>
      </ColumnWrapper>
      {currentApr > 0 && (
        <UserDataColumn>
          <UserDataTitleValue
            state={currentApr > 0 ? ValueStates.success : undefined}
            title="Current APY"
            value={`${formatNumber(currentApr.toString())}%`}
          />
          <UserDataTitleValue
            state={remainingRewards > 0 ? ValueStates.success : undefined}
            title="Rewards left"
            value={`${formatNumber(remainingRewards.toString())} OMN`}
          />

          <UserDataTitleValue
            state={earnedRewards > 0 ? ValueStates.success : undefined}
            title="Your Rewards"
            value={`${formatNumber(earnedRewards.toString())} OMN`}
          />
          <UserDataTitleValue
            state={totalRewards > 0 ? ValueStates.success : undefined}
            title="Total Rewards"
            value={`${formatNumber(totalRewards.toString())} OMN`}
          />
        </UserDataColumn>
      )}
    </UserDataWrapper>
  )
}
