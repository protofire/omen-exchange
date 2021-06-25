import { BigNumber } from 'ethers/utils'

import { calcAddFundingSendAmounts } from './calcAddFundingSendAmounts'
import { calcRemoveFundingSendAmounts } from './calcRemoveFundingSendAmounts'

export const calcSharesBought = (
  poolShares: BigNumber,
  balances: BigNumber[],
  shares: BigNumber[],
  collateralTokenAmount: BigNumber,
) => {
  const sendAmountsAfterAddingFunding = calcAddFundingSendAmounts(collateralTokenAmount, balances, poolShares)

  const sharesAfterAddingFunding = sendAmountsAfterAddingFunding
    ? shares.map((balance, i) => balance.add(sendAmountsAfterAddingFunding[i]))
    : shares.map(share => share)

  const sendAmountsAfterRemovingFunding = calcRemoveFundingSendAmounts(collateralTokenAmount, balances, poolShares)
  const depositedTokens = sendAmountsAfterRemovingFunding.reduce((min: BigNumber, amount: BigNumber) =>
    amount.lt(min) ? amount : min,
  )
  const sharesAfterRemovingFunding = shares.map((share, i) => {
    return share.add(sendAmountsAfterRemovingFunding[i]).sub(depositedTokens)
  })

  return sharesAfterAddingFunding[0].sub(sharesAfterRemovingFunding[0])
}
