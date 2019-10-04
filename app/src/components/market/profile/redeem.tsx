import React, { useState } from 'react'
import styled from 'styled-components'
import { ethers } from 'ethers'

import { ViewCard } from '../view_card'
import { Button } from '../../common'
import { FullLoading } from '../../common/full_loading'
import { ButtonContainer } from '../../common/button_container'
import { Table, TD, TH, THead, TR } from '../../common/table'
import { SubsectionTitle } from '../../common/subsection_title'
import { ClosedMarket } from '../../common/closed_market'
import { BalanceItems, Status } from '../../../util/types'
import { ConditionalTokenService, FetchMarketService } from '../../../services'
import { useConnectedWeb3Context } from '../../../hooks/connectedWeb3'
import { getContractAddress } from '../../../util/addresses'
import { getLogger } from '../../../util/logger'
import { formatDate } from '../../../util/tools'

const TDStyled = styled(TD)<{ winningOutcome?: boolean }>`
  color: ${props => (props.winningOutcome ? props.theme.colors.primary : 'inherit')};
  font-weight: ${props => (props.winningOutcome ? '700' : '400')};
  opacity: ${props => (props.winningOutcome ? '1' : '0.35')};
`

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
  balance: BalanceItems[]
  marketAddress: string
  resolution: Date
}

const logger = getLogger('Market::Redeem')

export const Redeem = (props: Props) => {
  const context = useConnectedWeb3Context()

  const { balance, marketAddress, resolution } = props

  const [status, setStatus] = useState<Status>(Status.Ready)

  const TableHead = ['Outcome', 'Shares', 'Price', 'Payout']
  const TableCellsAlign = ['left', 'right', 'right', 'right']

  const renderTableHeader = (): React.ReactNode => {
    return (
      <THead>
        <TR>
          {TableHead.map((value, index) => {
            return (
              <TH key={index} textAlign={TableCellsAlign[index]}>
                {value}
              </TH>
            )
          })}
        </TR>
      </THead>
    )
  }

  const renderTableData = () => {
    return balance.map((balanceItem: any, index: number) => {
      const { outcomeName, currentPrice, shares, winningOutcome } = balanceItem
      return (
        <TR key={index}>
          <TDStyled textAlign={TableCellsAlign[0]} winningOutcome={winningOutcome}>
            {outcomeName}
          </TDStyled>
          <TDStyled textAlign={TableCellsAlign[1]} winningOutcome={winningOutcome}>
            {ethers.utils.formatUnits(shares, 18)}
          </TDStyled>
          <TDStyled textAlign={TableCellsAlign[2]} winningOutcome={winningOutcome}>
            {currentPrice} DAI
          </TDStyled>
          <TDStyled textAlign={TableCellsAlign[3]} winningOutcome={winningOutcome}>
            {ethers.utils.formatUnits(shares, 18)}
          </TDStyled>
        </TR>
      )
    })
  }

  const finish = async () => {
    try {
      setStatus(Status.Loading)
      const provider = context.library
      const networkId = context.networkId

      const daiAddress = getContractAddress(networkId, 'dai')

      const fetchMarketService = new FetchMarketService(marketAddress, networkId, provider)
      const conditionId = await fetchMarketService.getConditionId()

      await ConditionalTokenService.redeemPositions(daiAddress, conditionId, networkId, provider)

      setStatus(Status.Ready)
    } catch (err) {
      setStatus(Status.Error)
      logger.log(`Error trying to redeem: ${err.message}`)
    }
  }

  const haveShares = balance.every((balanceItem: BalanceItems) => balanceItem.shares.isZero())

  return (
    <>
      <ClosedMarket date={formatDate(resolution)} />
      <ViewCard>
        <SubsectionTitle>Balance</SubsectionTitle>
        <Table head={renderTableHeader()}>{renderTableData()}</Table>
        <ButtonContainerStyled>
          <Button disabled={haveShares} onClick={() => finish()}>
            Redeem
          </Button>
        </ButtonContainerStyled>
      </ViewCard>
      {status === Status.Loading ? <FullLoading /> : null}
    </>
  )
}
