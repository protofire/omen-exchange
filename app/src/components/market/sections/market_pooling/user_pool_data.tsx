import { BigNumber } from 'ethers/utils'
import React from 'react'
import styled from 'styled-components'

import { formatBigNumber, formatNumber } from '../../../../util/tools'
import { Token } from '../../../../util/types'
import { TitleValue } from '../../../common'
import { ValueStates } from '../../common/transaction_details_row'

const UserDataTitleValue = styled(TitleValue)`
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

const UserData = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin: 0 -25px;
  padding: 20px 24px;
  border-top: ${({ theme }) => theme.borders.borderLineDisabled};
  @media (max-width: ${props => props.theme.themeBreakPoints.sm}) {
    flex-wrap: nowrap;
    flex-direction: column;
  }
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
    totalUserLiquidity,
    userEarnings,
  } = props

  return (
    <UserData>
      <UserDataTitleValue
        title="Your Liquidity"
        value={`${formatNumber(
          formatBigNumber(totalUserLiquidity, collateral.decimals, collateral.decimals),
        )} ${symbol}`}
      />
      <UserDataTitleValue
        title="Total Pool Tokens"
        value={`${formatNumber(formatBigNumber(totalPoolShares, collateral.decimals, collateral.decimals))}`}
      />
      <UserDataTitleValue
        state={userEarnings.gt(0) ? ValueStates.success : undefined}
        title="Your Earnings"
        value={`${userEarnings.gt(0) ? '+' : ''}${formatNumber(
          formatBigNumber(userEarnings, collateral.decimals),
        )} ${symbol}`}
      />
      <UserDataTitleValue
        state={totalEarnings.gt(0) ? ValueStates.success : undefined}
        title="Total Earnings"
        value={`${totalEarnings.gt(0) ? '+' : ''}${formatNumber(
          formatBigNumber(totalEarnings, collateral.decimals),
        )} ${symbol}`}
      />
      {/* TODO: Replace hardcoded data */}
      <UserDataTitleValue
        state={currentApr > 0 ? ValueStates.success : undefined}
        title="Current APY"
        value={`${formatNumber(currentApr.toString())}%`}
      />
      {/* TODO: Replace hardcoded data */}
      <UserDataTitleValue
        state={remainingRewards > 0 ? ValueStates.success : undefined}
        title="Total Rewards left"
        value={`${formatNumber(remainingRewards.toString())} OMN`}
      />
      {/* TODO: Replace hardcoded data */}
      <UserDataTitleValue
        state={earnedRewards > 0 ? ValueStates.success : undefined}
        title="Your Rewards"
        value={`${formatNumber(earnedRewards.toString())} OMN`}
      />
      {/* TODO: Replace hardcoded data */}
      <UserDataTitleValue state={ValueStates.success} title="Total Rewards" value={'500.00 OMN'} />
    </UserData>
  )
}
