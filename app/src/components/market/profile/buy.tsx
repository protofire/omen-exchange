import React, { useState } from 'react'
import styled from 'styled-components'
import { BigNumber } from 'ethers/utils'
import { ethers } from 'ethers'

import { Button, Textfield } from '../../common'
import { BalanceItems, OutcomeSlots, Status } from '../../../util/types'
import { formatBN } from '../../../util/tools'
import { ERC20Service, MarketMakerService } from '../../../services'
import { useConnectedWeb3Context } from '../../../hooks/connectedWeb3'
import { getContractAddress } from '../../../util/addresses'
import { getLogger } from '../../../util/logger'
import { computePriceAfterTrade } from '../../../util/tools'

interface Props {
  balance: BalanceItems[]
  funding: BigNumber
  marketAddress: string
  handleBack: () => void
  handleFinish: () => void
}

const DivStyled = styled.div`
  width: 5px;
  height: auto;
  display: inline-block;
`

const TableStyled = styled.table`
  width: 100%;
`

const THStyled = styled.th`
  border-bottom: 1px solid #ddd;
`

const TDStyled = styled.th`
  border-bottom: 1px solid #ddd;
`
const Div = styled.div`
  height: 50px;
  display: flex;
  align-items: center;
`

const InputStyled = styled(Textfield)`
  text-align: right;
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`

const Span = styled.span`
  margin-left: 5px;
  width: 25px;
`
const DivLabel = styled.div`
  height: 30px;
  display: flex;
  align-items: center;
`

const logger = getLogger('Market::Buy')

const Buy = (props: Props) => {
  const context = useConnectedWeb3Context()

  const { balance, marketAddress, funding } = props

  const [status, setStatus] = useState<Status>(Status.Ready)
  const [outcome, setOutcome] = useState<OutcomeSlots>(OutcomeSlots.Yes)
  const [cost, setCost] = useState<BigNumber>(new BigNumber(0))
  const [tradedShares, setTradedShares] = useState<BigNumber>(new BigNumber(0))

  const handleChangeOutcome = async (e: any) => {
    const outcomeSelected: OutcomeSlots = e.target.value
    setOutcome(outcomeSelected)
  }

  const renderTableHeader = ['Outcome', 'Probabilities', 'Current Price', 'Price after trade'].map(
    (value, index) => {
      return <THStyled key={index}>{value}</THStyled>
    },
  )

  const [tradeYes, tradeNo] =
    outcome === OutcomeSlots.Yes
      ? [tradedShares, ethers.constants.Zero]
      : [ethers.constants.Zero, tradedShares]
  const holdingsYes = balance[0].holdings
  const holdingsNo = balance[1].holdings
  const pricesAfterTrade = computePriceAfterTrade(
    tradeYes,
    tradeNo,
    holdingsYes,
    holdingsNo,
    funding,
  )

  const renderTableData = balance.map((balanceItem: BalanceItems, index: number) => {
    const { outcomeName, probability, currentPrice } = balanceItem
    const defaultChecked = outcomeName === OutcomeSlots.Yes

    return (
      <tr key={index}>
        <TDStyled>
          <input
            type="radio"
            value={outcomeName}
            defaultChecked={defaultChecked}
            name="outcome"
            onChange={(e: any) => handleChangeOutcome(e)}
          />{' '}
          {outcomeName}
        </TDStyled>
        <TDStyled>{probability} %</TDStyled>
        <TDStyled>{currentPrice} DAI</TDStyled>
        <TDStyled>{pricesAfterTrade[index].toFixed(4)} DAI</TDStyled>
      </tr>
    )
  })

  const handleChangeAmount = async (event: any) => {
    event.persist()

    const value = +event.target.value

    const balanceItem: BalanceItems | undefined = balance.find((balanceItem: BalanceItems) => {
      return balanceItem.outcomeName === outcome
    })

    const price = balanceItem ? +balanceItem.currentPrice : 1
    const amount = value / price

    // Not allow decimals
    const amountInWei = ethers.utils
      .bigNumberify(Math.round(10000 * amount))
      .mul(ethers.constants.WeiPerEther)
      .div(10000)

    setTradedShares(amountInWei)

    const costWithFee = ethers.utils
      .bigNumberify(Math.round(value * 1.01 * 10000))
      .mul(ethers.constants.WeiPerEther)
      .div(10000)
    setCost(costWithFee)
  }

  const finish = async () => {
    try {
      setStatus(Status.Loading)
      const provider = context.library
      const networkId = context.networkId
      const user = await provider.getSigner().getAddress()

      const daiAddress = getContractAddress(networkId, 'dai')
      const marketMakerFactoryAddress = getContractAddress(networkId, 'marketMakerFactory')

      const marketMakerService = new MarketMakerService(marketAddress)
      const daiService = new ERC20Service(daiAddress)

      const hasEnoughAlowance = await daiService.hasEnoughAllowance(
        provider,
        user,
        marketMakerFactoryAddress,
        cost,
      )

      if (!hasEnoughAlowance) {
        await daiService.approve(provider, marketMakerFactoryAddress, cost)
      }

      // Check outcome value to use
      const outcomeValue = outcome === OutcomeSlots.Yes ? [tradedShares, 0] : [0, tradedShares]

      await marketMakerService.trade(provider, outcomeValue)

      setStatus(Status.Ready)
      props.handleFinish()
    } catch (err) {
      setStatus(Status.Error)
      logger.log(`Error trying to buy: ${err.message}`)
    }
  }

  const disabled = (status !== Status.Ready && status !== Status.Error) || cost.isZero()

  return (
    <>
      <h6>Choose the shares you want to buy</h6>
      <TableStyled>
        <tbody>
          <tr>{renderTableHeader}</tr>
          {renderTableData}
        </tbody>
      </TableStyled>
      <div className="row">
        <div className="col">
          <label>Amount</label>
          <Div>
            <InputStyled name="amount" type="number" onChange={(e: any) => handleChangeAmount(e)} />
            <Span>DAI</Span>
          </Div>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <DivLabel>
            <strong>Totals</strong>
          </DivLabel>
          <DivLabel>
            <label>You spend: {formatBN(cost)} DAI</label>
          </DivLabel>
          <DivLabel>
            <label>
              &quot;{outcome}&quot; shares you get {formatBN(tradedShares)} shares
            </label>
          </DivLabel>
        </div>
      </div>

      <div className="row">
        <p>1 shares can be redeemed for 1 DAI in case it represents the final outcome.</p>
        <p>Status: {status}</p>
      </div>
      <div className="row right">
        <Button onClick={() => props.handleBack()}>Back</Button>
        <DivStyled />
        <Button disabled={disabled} onClick={() => finish()}>
          Finish
        </Button>
      </div>
    </>
  )
}

export { Buy }
