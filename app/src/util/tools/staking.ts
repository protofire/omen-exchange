import { BigNumber, parseUnits } from 'ethers/utils'

import { YEAR_IN_SECONDS } from '../../common/constants'

import { bigNumberToNumber } from './formatting'

export const getRemainingRewards = (
  rewardsAmount: BigNumber,
  timeRemaining: number,
  duration: number,
  decimals: number,
): BigNumber => {
  const durationFraction = timeRemaining / duration
  const rewardsAmountNumber = bigNumberToNumber(rewardsAmount, decimals)
  return parseUnits((rewardsAmountNumber * durationFraction).toString(), decimals)
}

export const calculateRewardApr = (
  totalStakedTokens: number,
  timeRemaining: number,
  remainingRewards: number,
  stakedTokenPrice: number,
  rewardTokenPrice: number,
): number => {
  if (remainingRewards <= 0) {
    return 0
  }
  const timeMultiple = YEAR_IN_SECONDS / timeRemaining
  const tokensPerYear = timeMultiple * remainingRewards
  const usdPerYear = tokensPerYear * rewardTokenPrice
  const stakedUsd = totalStakedTokens * stakedTokenPrice
  return (usdPerYear / stakedUsd) * 100
}
