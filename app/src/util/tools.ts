import { ethers } from 'ethers'
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

export const divBN = (a: BigNumber, b: BigNumber, scale = 10000): number => {
  return (
    a
      .mul(scale)
      .div(b)
      .toNumber() / scale
  )
}

const mulBN = (a: BigNumber, b: number, scale = 10000): BigNumber => {
  return a.mul(Math.round(b * scale)).div(scale)
}

/**
 * Computes the price of some outcome tokens, given the initial funding and the current holdings.
 */
export const calcPrice = (funding: BigNumber, holdings: BigNumber) => {
  // 2^(-holding / funding)
  return Math.pow(2, -divBN(holdings, funding))
}

/**
 * Computes the cost in collateral of trading `tradeYes` and `tradeNo` outcomes, given that the initial funding is
 * `funding` and the current prices.
 */
export const calcNetCost = (
  funding: BigNumber,
  priceYes: number,
  tradeYes: BigNumber,
  priceNo: number,
  tradeNo: BigNumber,
): BigNumber => {
  // funding * (offset + log2(oddYes * (2^(tradeYes / funding - offset)) + oddNo * (2^(tradeNo / funding) - offset))
  const offset = Math.max(divBN(tradeYes, funding), divBN(tradeNo, funding))

  const logTerm =
    offset +
    Math.log2(
      priceYes * Math.pow(2, divBN(tradeYes, funding) - offset) +
        priceNo * Math.pow(2, divBN(tradeNo, funding) - offset),
    )
  return mulBN(funding, logTerm)
}

export const computeBalanceAfterTrade = (
  holdingsYes: BigNumber,
  holdingsNo: BigNumber,
  amountCollateral: BigNumber,
): { balanceOfForYes: BigNumber; balanceOfForNo: BigNumber } => {
  // -sellSharesY = sharesNo - collateral - (sharesYes*sharesNo) / (sharesYes - collateral - (fee * collateral))
  const holdingsNoSubCollateral = holdingsNo.sub(amountCollateral)
  const holdingsYesSubCollateral = holdingsYes.sub(amountCollateral)

  const dividingNo = holdingsNoSubCollateral.sub(holdingsYes.mul(holdingsNo))
  const dividerNo = holdingsYesSubCollateral.sub(
    ethers.utils
      .bigNumberify('' + Math.round(1.01 * 10000))
      .mul(amountCollateral)
      .div(10000),
  )
  const balanceOfForYes = dividingNo.div(dividerNo)

  // -sellSharesN = sharesYes - collateral - (sharesYes*sharesNo) / (sharesNo - collateral - (fee * collateral))
  const dividingYes = holdingsYesSubCollateral.sub(holdingsYes.mul(holdingsNo))
  const dividerYes = holdingsNoSubCollateral.sub(
    ethers.utils
      .bigNumberify('' + Math.round(1.01 * 10000))
      .mul(amountCollateral)
      .div(10000),
  )
  const balanceOfForNo = dividingYes.div(dividerYes)

  return { balanceOfForYes, balanceOfForNo }
}
