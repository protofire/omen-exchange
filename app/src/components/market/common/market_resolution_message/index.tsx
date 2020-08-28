import { BigNumber } from 'ethers/utils'
import React from 'react'
import styled from 'styled-components'

import { formatBigNumber } from '../../../../util/tools'
import { Arbitrator, Token } from '../../../../util/types'

import { Invalid } from './img/Invalid'
import { Lost } from './img/Lost'
import { Won } from './img/Won'

const Wrapper = styled.div`
  border-radius: 4px;
  border: 1px solid ${props => props.theme.borders.borderColorLighter};
  display: flex;
  padding: 20px 25px;
`

const Icon = styled.div`
  margin-right: 20px;
`

const TextWrapper = styled.div``

const Title = styled.h2<{ isWinner: boolean }>`
  color: ${props => (props.isWinner ? props.theme.colors.primary : props.theme.colors.textColorDarker)};
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.2px;
  line-height: 1.2;
  margin: 0 0 8px;
`

Title.defaultProps = {
  isWinner: true,
}

const Text = styled.div`
  color: ${props => props.theme.colors.textColor};
  font-size: 14px;
  font-weight: normal;
  letter-spacing: 0.4px;
  line-height: 1.5;
  margin: 0;
`
const TextHighlight = styled.span`
  color: ${props => props.theme.colors.green};
  font-weight: 500;
  font-family: 'Roboto';
`

interface Props {
  arbitrator: Arbitrator
  collateralToken: Token
  earnedCollateral: Maybe<BigNumber>
  invalid: boolean
  userWinnerShares: BigNumber
  userWinnersOutcomes: number
  winnersOutcomes: number
}

const MarketResolutionMessage = (props: Props) => {
  const {
    arbitrator,
    collateralToken,
    earnedCollateral,
    invalid,
    userWinnerShares,
    userWinnersOutcomes,
    winnersOutcomes,
    ...restProps
  } = props

  const shares = formatBigNumber(userWinnerShares, collateralToken.decimals)
  const redeemString = earnedCollateral
    ? `${formatBigNumber(earnedCollateral, collateralToken.decimals)} ${collateralToken.symbol}`
    : 'NaN'

  const lost = !invalid && userWinnersOutcomes === 0 && parseFloat(shares) > 0
  const wonSingle = !invalid && userWinnersOutcomes === 1
  const wonMultiple = !invalid && userWinnersOutcomes > 1
  const participated = invalid || lost || wonSingle || wonMultiple

  let infoText = ''
  let infoTitle = ''
  let icon: React.ReactNode

  if (invalid) {
    infoTitle = 'Market is invalid!'
    icon = <Invalid />
    infoText = `${arbitrator.name} declared this market invalid. You own ${shares} Shares of ${
      userWinnersOutcomes === 1 ? `an outcome` : `${userWinnersOutcomes} outcomes`
    }
      which can be redeem for `
  }

  if (lost) {
    infoTitle = 'Better luck next time!'
    icon = <Lost />
    infoText = `You have bought ${shares} Shares of the loosing outcome which leads to a loss of `
  }

  if (wonSingle) {
    infoTitle = 'Congratulations!'
    icon = <Won />
    infoText = `You have bought ${shares} Shares of the winning outcome which can be redeemed for `
  }

  if (wonMultiple) {
    infoTitle = 'Congratulations!'
    icon = <Won />
    infoText = `${arbitrator.name} declared ${winnersOutcomes} outcomes as valid. You have bought ${shares} Shares of ${userWinnersOutcomes} of the
  winning outcomes which can be redeemed for `
  }

  return participated ? (
    <Wrapper {...restProps}>
      <Icon>{icon}</Icon>
      <TextWrapper>
        <Title isWinner={wonSingle || wonMultiple}>{infoTitle}</Title>
        <Text>
          {infoText} <TextHighlight>{redeemString}</TextHighlight>.
        </Text>
      </TextWrapper>
    </Wrapper>
  ) : null
}

export default MarketResolutionMessage
