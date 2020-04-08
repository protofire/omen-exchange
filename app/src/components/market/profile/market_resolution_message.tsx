import { BigNumber } from 'ethers/utils'
import React from 'react'

import { formatBigNumber } from '../../../util/tools'
import { Token } from '../../../util/types'

interface Props {
  earnedCollateral: Maybe<BigNumber>
  collateralToken: Token
  winnersOutcomes: number
  userWinnersOutcomes: number
  userWinnerShares: BigNumber
  invalid: boolean
}

const MarketResolutionMessage = (props: Props) => {
  const { collateralToken, earnedCollateral, invalid, userWinnerShares, userWinnersOutcomes, winnersOutcomes } = props

  if (!earnedCollateral) {
    return null
  }
  const shares = formatBigNumber(userWinnerShares, collateralToken.decimals)
  const redeemString = `${formatBigNumber(earnedCollateral, collateralToken.decimals)} ${collateralToken.symbol}`
  if (invalid) {
    return (
      <p>{`Realit.io declared this market invalid. You own ${shares} Shares of ${
        userWinnersOutcomes === 1 ? `an outcome` : `${userWinnersOutcomes} outcomes`
      }
      which can be redeem for ${redeemString}`}</p>
    )
  } else {
    if (userWinnersOutcomes === 1) {
      return (
        <p>
          {`Congratulation! You have bought ${shares} Shares of the winning outcome which can be redeemed for ${redeemString}`}
        </p>
      )
    } else {
      return (
        <p>{`Realit.io declared ${winnersOutcomes} outcomes as valid. You have bought ${shares} Shares of ${userWinnersOutcomes} of the
    winning outcomes which can be redeemed for ${redeemString}.`}</p>
      )
    }
  }
}

export default MarketResolutionMessage
