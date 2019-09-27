import { BigNumber } from 'ethers/utils'
import { ethers } from 'ethers'

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

const divBN = (a: BigNumber, b: BigNumber, scale = 10000): number => {
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
  // funding * log2(oddYes * (2^(tradeYes / funding)) + oddNo * (2^(tradeNo / funding)))
  const logTerm = Math.log2(
    priceYes * Math.pow(2, divBN(tradeYes, funding)) +
      priceNo * Math.pow(2, divBN(tradeNo, funding)),
  )
  return mulBN(funding, logTerm)
}

/**
 * Computes the price of the outcome tokens after trading `tradeYes` and `tradeNo`, given the initial funding is
 * `funding` and holdings.
 *
 * Returns an array with the price the `yes` and the `no` outcome tokens will have after executing that trade.
 */
export const computePriceAfterTrade = (
  tradeYes: BigNumber,
  tradeNo: BigNumber,
  holdingsYes: BigNumber,
  holdingsNo: BigNumber,
  funding: BigNumber,
): [number, number] => {
  const priceYes = calcPrice(funding, holdingsYes)
  const priceNo = calcPrice(funding, holdingsNo)

  const netCost = calcNetCost(funding, priceYes, tradeYes, priceNo, tradeNo)

  const newHoldingsYes = holdingsYes.sub(tradeYes).add(netCost)
  const newHoldingsNo = holdingsNo.sub(tradeNo).add(netCost)

  const newPriceYes = calcPrice(funding, newHoldingsYes)
  const newPriceNo = calcPrice(funding, newHoldingsNo)

  return [newPriceYes, newPriceNo]
}

export const formatBN = (bn: BigNumber): string => {
  const integer = bn.div(ethers.constants.WeiPerEther).toString()
  const mantissa = bn.mod(ethers.constants.WeiPerEther).toString()
  const x = +`${integer}.${mantissa}`

  return x.toFixed(2)
}
