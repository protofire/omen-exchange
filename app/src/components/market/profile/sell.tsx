import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { BigNumber } from 'ethers/utils'
import { ethers } from 'ethers'

import { Button, Textfield } from '../../common'
import { BalanceItems, OutcomeSlots, Status } from '../../../util/types'
import { MarketMakerService } from '../../../services'
import { useConnectedWeb3Context } from '../../../hooks/connectedWeb3'
import { getLogger } from '../../../util/logger'
import { formatBN } from '../../../util/tools'

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

const logger = getLogger('Market::Sell')

const Sell = (props: Props) => {
  const context = useConnectedWeb3Context()

  const { balance, marketAddress } = props

  const [status, setStatus] = useState<Status>(Status.Ready)
  const [balanceItem, setBalanceItem] = useState<BalanceItems>()
  const [outcome, setOutcome] = useState<OutcomeSlots>(OutcomeSlots.Yes)
  const [amountShares, setAmountShares] = useState<BigNumber>(new BigNumber(0))
  const [tradedDAI, setTradedDAI] = useState<BigNumber>(new BigNumber(0))
  const [costFee, setCostFee] = useState<BigNumber>(new BigNumber(0))

  useEffect(() => {
    const balanceItemFound: BalanceItems | undefined = balance.find((balanceItem: BalanceItems) => {
      return balanceItem.outcomeName === outcome
    })
    setBalanceItem(balanceItemFound)

    const individualPrice = balanceItemFound ? +balanceItemFound.currentPrice : 1
    const amountToSell = individualPrice * amountShares.toNumber()

    const amountToSellInWei = ethers.utils
      .bigNumberify(Math.round(amountToSell * 10000))
      .mul(ethers.constants.WeiPerEther)
      .div(10000)

    const costFeeInWei = ethers.utils
      .bigNumberify(Math.round(((amountToSell * 1.01) / 100) * 10000))
      .mul(ethers.constants.WeiPerEther)
      .div(10000)

    setCostFee(costFeeInWei)

    setTradedDAI(amountToSellInWei.sub(costFeeInWei))
  }, [outcome, amountShares, balance])

  const renderTableHeader = ['Outcome', 'Probabilities', 'Current Price', 'Shares'].map(
    (value, index) => {
      return <THStyled key={index}>{value}</THStyled>
    },
  )

  const renderTableData = balance.map((balanceItem: BalanceItems, index: number) => {
    const { outcomeName, probability, currentPrice, shares } = balanceItem
    const defaultChecked = outcomeName === OutcomeSlots.Yes

    return (
      <tr key={index}>
        <TDStyled>
          <input
            type="radio"
            value={outcomeName}
            defaultChecked={defaultChecked}
            name="outcome"
            onChange={(e: any) => setOutcome(e.target.value)}
          />{' '}
          {outcomeName}
        </TDStyled>
        <TDStyled>{probability} %</TDStyled>
        <TDStyled>{currentPrice} DAI</TDStyled>
        <TDStyled>{formatBN(shares)}</TDStyled>
      </tr>
    )
  })

  const finish = async () => {
    try {
      if (
        !(balanceItem && amountShares.mul(ethers.constants.WeiPerEther).lte(balanceItem.shares))
      ) {
        throw new Error('There are not enough shares to sell')
      }

      setStatus(Status.Loading)

      const provider = context.library
      const marketMakerService = new MarketMakerService(marketAddress)

      const amountSharesNegative = amountShares.mul(-1)
      const outcomeValue =
        outcome === OutcomeSlots.Yes ? [amountSharesNegative, 0] : [0, amountSharesNegative]

      await marketMakerService.trade(provider, outcomeValue)

      setStatus(Status.Ready)
      props.handleFinish()
    } catch (err) {
      setStatus(Status.Error)
      logger.log(`Error trying to sell: ${err.message}`)
    }
  }

  const disabled = (status !== Status.Ready && status !== Status.Error) || amountShares.isZero()

  return (
    <>
      <h6>Choose the shares you want to sell</h6>
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
            <InputStyled
              name="amount"
              type="number"
              onChange={(e: any) => setAmountShares(ethers.utils.bigNumberify(e.target.value))}
            />
            <Span>Shares</Span>
          </Div>
          <label>
            You will be charged an extra 1.01% trade fee of {ethers.utils.formatEther(costFee)} DAI
          </label>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <DivLabel>
            <strong>Totals</strong>
          </DivLabel>
          <DivLabel>
            <label>Total DAI return: {ethers.utils.formatEther(tradedDAI)} DAI</label>
          </DivLabel>
        </div>
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

export { Sell }
