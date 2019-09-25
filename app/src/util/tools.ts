import { BigNumber } from 'ethers/utils'

export const truncateStringInTheMiddle = (
  str: string,
  strLength = 41,
  strPositionStart = 8,
  strPositionEnd = 8,
) => {
  if (str.length > strLength) {
    return `${str.substr(0, strPositionStart)}...${str.substr(
      str.length - strPositionEnd,
      str.length,
    )}`
  }
  return str
}

/**
 * Returns the amount of outcome tokens that need to be bought to set the probabilities to `targetProbabilities`,
 * assuming the current probabilities are uniform.
 *
 * @param targetProbabilities - An array of probabilities specified over 100. For example [75, 25].
 * @param funding - The initial funding of the market maker, in wei.
 */
export const computeInitialTradeOutcomeTokens = (
  targetProbabilities: number[],
  funding: BigNumber,
): BigNumber[] => {
  const numOutcomes = targetProbabilities.length
  const netTradeAmountForOutcomes = targetProbabilities.map(targetProbability => {
    const logProbabilities =
      Math.log(targetProbability / (100 / numOutcomes)) / Math.log(numOutcomes)
    const logProbabilitiesBN = new BigNumber(Math.round(logProbabilities * 10000))
    return funding.mul(logProbabilitiesBN).div(10000)
  })

  const cost = netTradeAmountForOutcomes.reduce((a, b) => (a.lt(b) ? a : b)).mul(-1)

  const buyAmounts = netTradeAmountForOutcomes.map(x => x.add(cost))

  return buyAmounts
}

export const formatDate = (date: Date): string => {
  const dateParts = date.toString().split(/\s+/)
  return dateParts.slice(1, 6).join(' ')
}
