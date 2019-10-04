import React, { useEffect, useState } from 'react'
import styled, { withTheme } from 'styled-components'
import { ethers } from 'ethers'
import { BigNumber } from 'ethers/utils'

import { ViewCard } from '../view_card'
import { Button } from '../../common'
import { FullLoading } from '../../common/full_loading'
import { ButtonContainer } from '../../common/button_container'
import { Table, TD, TH, THead, TR } from '../../common/table'
import { SubsectionTitle } from '../../common/subsection_title'
import { TitleValue } from '../../common/title_value'
import { ClosedMarket } from '../../common/closed_market'
import { BalanceItems, Status } from '../../../util/types'
import {
  ConditionalTokenService,
  ERC20Service,
  FetchMarketService,
  MarketMakerService,
} from '../../../services'
import { getContractAddress } from '../../../util/addresses'
import { useConnectedWeb3Context } from '../../../hooks/connectedWeb3'
import { getLogger } from '../../../util/logger'
import { formatDate } from '../../../util/tools'

const TDStyled = styled(TD)<{ winningOutcome?: boolean }>`
  color: ${props => (props.winningOutcome ? props.theme.colors.primary : 'inherit')};
  font-weight: ${props => (props.winningOutcome ? '700' : '400')};
  opacity: ${props => (props.winningOutcome ? '1' : '0.35')};
`

TDStyled.defaultProps = {
  winningOutcome: false,
}

const TableStyled = styled(Table)`
  margin-bottom: 30px;
`

const Grid = styled.div`
  display: grid;
  grid-column-gap: 20px;
  grid-row-gap: 14px;
  grid-template-columns: 1fr;
  margin-bottom: 25px;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    grid-template-columns: 1fr 1fr 1fr;
  }
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
  theme?: any
  balance: BalanceItems[]
  funding: BigNumber
  question: string
  resolution: Date
  marketAddress: string
}

const logger = getLogger('Market::Withdraw')

export const WithdrawWrapper = (props: Props) => {
  const context = useConnectedWeb3Context()

  const { theme, balance, marketAddress, resolution, funding } = props

  const [status, setStatus] = useState<Status>(Status.Ready)
  const [message, setMessage] = useState('')
  const [collateral, setCollateral] = useState<BigNumber>(new BigNumber(0))

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
          <TDStyled winningOutcome={winningOutcome} textAlign={TableCellsAlign[0]}>
            {outcomeName}
          </TDStyled>
          <TDStyled winningOutcome={winningOutcome} textAlign={TableCellsAlign[1]}>
            {ethers.utils.formatUnits(shares, 18)}
          </TDStyled>
          <TDStyled winningOutcome={winningOutcome} textAlign={TableCellsAlign[2]}>
            {currentPrice} DAI
          </TDStyled>
          <TDStyled winningOutcome={winningOutcome} textAlign={TableCellsAlign[3]}>
            {ethers.utils.formatUnits(shares, 18)}
          </TDStyled>
        </TR>
      )
    })
  }

  useEffect(() => {
    const fetchBalance = async () => {
      const provider = context.library
      const networkId = context.networkId

      const daiAddress = getContractAddress(networkId, 'dai')
      const daiService = new ERC20Service(daiAddress)
      const collateralBalance = await daiService.getCollateral(marketAddress, provider)
      setCollateral(collateralBalance)
    }

    fetchBalance()
  }, [collateral, context, marketAddress])

  const redeem = async () => {
    try {
      setMessage('Redeem payout...')
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

  const withdraw = async () => {
    try {
      setMessage('Withdraw collateral...')
      setStatus(Status.Loading)

      const provider = context.library
      const marketMakerService = new MarketMakerService(marketAddress)
      await marketMakerService.withdrawFees(provider)

      setStatus(Status.Ready)
    } catch (err) {
      setStatus(Status.Error)
      logger.log(`Error trying to withdraw: ${err.message}`)
    }
  }

  const fundingFormat = ethers.utils.formatUnits(funding, 18)
  const collateralFormat = `${ethers.utils.formatUnits(collateral, 18)} DAI`

  return (
    <>
      <ClosedMarket date={formatDate(resolution)} />
      <ViewCard>
        {<SubsectionTitle>Balance</SubsectionTitle>}
        <TableStyled head={renderTableHeader()}>{renderTableData()}</TableStyled>
        <SubsectionTitle>Details</SubsectionTitle>
        <Grid>
          <TitleValue title="Category" value="Politics" />
          <TitleValue title="Oracle" value="realit.io and dxDAO" />
          <TitleValue title="Resolution Date" value={formatDate(resolution)} />
          <TitleValue title="Fee" value="1%" />
          <TitleValue title="Funding" value={fundingFormat} />
        </Grid>
        <SubsectionTitle>Market Results</SubsectionTitle>
        <Grid>
          <TitleValue title="Collateral" value={collateralFormat} />
        </Grid>
        <ButtonContainerStyled>
          <Button onClick={() => redeem()}>Redeem</Button>
          <Button backgroundColor={theme.colors.secondary} onClick={() => withdraw()}>
            Withdraw Collateral
          </Button>
        </ButtonContainerStyled>
      </ViewCard>
      {status === Status.Loading ? <FullLoading message={message} /> : null}
    </>
  )
}

export const Withdraw = withTheme(WithdrawWrapper)
