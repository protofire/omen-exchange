import React, { useState } from 'react'
import styled from 'styled-components'

import { ViewCard } from '../view_card'
import { Button, OutcomeTable } from '../../common'
import { FullLoading } from '../../common/full_loading'
import { ButtonContainer } from '../../common/button_container'
import { SubsectionTitle } from '../../common/subsection_title'
import { ClosedMarket } from '../../common/closed_market'
import { BalanceItem, OutcomeTableValue, Status } from '../../../util/types'
import { MarketMakerService } from '../../../services'
import { useConnectedWeb3Context } from '../../../hooks/connectedWeb3'
import { useContracts } from '../../../hooks/useContracts'
import { getContractAddress } from '../../../util/addresses'
import { getLogger } from '../../../util/logger'
import { formatDate } from '../../../util/tools'

const ButtonContainerStyled = styled(ButtonContainer)`
  display: grid;
  grid-row-gap: 10px;
  grid-template-columns: 1fr;

  > button {
    margin-left: 0;
  }

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    display: flex;

    > button {
      margin-left: 10px;
    }
  }
`

interface Props {
  balance: BalanceItem[]
  marketAddress: string
  resolution: Date | null
}

const logger = getLogger('Market::Redeem')

export const Redeem = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { conditionalTokens } = useContracts(context)

  const { balance, marketAddress, resolution } = props

  const [status, setStatus] = useState<Status>(Status.Ready)

  const finish = async () => {
    try {
      setStatus(Status.Loading)
      const provider = context.library
      const networkId = context.networkId

      const daiAddress = getContractAddress(networkId, 'dai')

      const fetchMarketService = new MarketMakerService(marketAddress, conditionalTokens, provider)
      const conditionId = await fetchMarketService.getConditionId()

      await conditionalTokens.redeemPositions(daiAddress, conditionId)

      setStatus(Status.Ready)
    } catch (err) {
      setStatus(Status.Error)
      logger.log(`Error trying to redeem: ${err.message}`)
    }
  }

  const winningOutcome = balance.find((balanceItem: BalanceItem) => balanceItem.winningOutcome)

  return (
    <>
      <ClosedMarket date={resolution ? formatDate(resolution) : ''} />
      <ViewCard>
        <SubsectionTitle>Balance</SubsectionTitle>
        <OutcomeTable
          balance={balance}
          disabledColumns={[
            OutcomeTableValue.Probabilities,
            OutcomeTableValue.CurrentPrice,
            OutcomeTableValue.PriceAfterTrade,
          ]}
          withWinningOutcome={true}
        />
        <ButtonContainerStyled>
          <Button
            disabled={winningOutcome && winningOutcome.shares.isZero()}
            onClick={() => finish()}
          >
            Redeem
          </Button>
        </ButtonContainerStyled>
      </ViewCard>
      {status === Status.Loading ? <FullLoading /> : null}
    </>
  )
}
