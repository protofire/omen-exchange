import { BigNumber } from 'ethers/utils'
import React from 'react'
import styled from 'styled-components'

import { useConnectedWeb3Context } from '../../../contexts'
import { bigNumberToString, getInitialCollateral } from '../../../util/tools'
import { Token } from '../../../util/types'
import { TitleValue } from '../../common'
import { ValueStates } from '../common_sections/user_transactions_tokens/transaction_details_row'

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
  const collateral = getInitialCollateral(networkId, props.collateral)

  return (
    <UserData>
      <UserDataTitleValue
        title="Your Liquidity"
        value={`${bigNumberToString(totalUserLiquidity, collateral.decimals)} ${collateral.symbol}`}
      />
      <UserDataTitleValue
        title="Total Pool Tokens"
        value={`${bigNumberToString(totalPoolShares, collateral.decimals)}`}
      />
      <UserDataTitleValue
        state={userEarnings.gt(0) ? ValueStates.success : undefined}
        title="Your Earnings"
        value={`${userEarnings.gt(0) ? '+' : ''}${bigNumberToString(userEarnings, collateral.decimals)} ${
          collateral.symbol
        }`}
      />
      <UserDataTitleValue
        state={totalEarnings.gt(0) ? ValueStates.success : undefined}
        title="Total Earnings"
        value={`${totalEarnings.gt(0) ? '+' : ''}${bigNumberToString(totalEarnings, collateral.decimals)} ${
          collateral.symbol
        }`}
      />
      <UserDataTitleValue
        state={currentApr > 0 ? ValueStates.success : undefined}
        title="Current APR"
        value={`${formatNumber(currentApr.toString())}%`}
      />
      <UserDataTitleValue
        state={remainingRewards > 0 ? ValueStates.success : undefined}
        title="Total Rewards left"
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
    </UserData>
  )
}
