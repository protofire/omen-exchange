import { BigNumber } from 'ethers/utils'
import React from 'react'
import styled from 'styled-components'

import { useCompoundService, useConnectedWeb3Context } from '../../../../hooks'
import { formatBigNumber, formatNumber, getInitialCollateral } from '../../../../util/tools'
import { CompoundTokenType, Token } from '../../../../util/types'
import { TitleValue } from '../../../common'
import { ValueStates } from '../../common/transaction_details_row'

const UserDataTitleValue = styled(TitleValue)`
  flex: 0 calc(50% - 16px);

  &:nth-child(odd) {
    margin-right: 32px;
  }
  &:nth-child(-n + 2) {
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
}

export const UserPoolData: React.FC<Props> = (props: Props) => {
  const { collateral, totalEarnings, totalPoolShares, totalUserLiquidity, userEarnings } = props
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
    <UserData>
      <UserDataTitleValue
        title="Your Liquidity"
        value={`${formatNumber(
          formatBigNumber(displayUserLiquidity, baseCollateral.decimals, baseCollateral.decimals),
        )} ${baseCollateral.symbol}`}
      />
      <UserDataTitleValue
        title="Total Pool Tokens"
        value={`${formatNumber(formatBigNumber(displayPoolTokens, baseCollateral.decimals, baseCollateral.decimals))}`}
      />
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
    </UserData>
  )
}
