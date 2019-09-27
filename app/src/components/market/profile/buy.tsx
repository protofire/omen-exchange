import React, { useState } from 'react'
import styled from 'styled-components'
import { BigNumber } from 'ethers/utils'
import { ethers } from 'ethers'

import { Button } from '../../common'
import { BalanceItems, OutcomeSlots, Status } from '../../../util/types'
import { ERC20Service, MarketMakerService } from '../../../services'
import { useConnectedWeb3Context } from '../../../hooks/connectedWeb3'
import { getContractAddress } from '../../../util/addresses'
import { getLogger } from '../../../util/logger'

interface Props {
  balance: BalanceItems[]
  marketAddress: string
  handleBack: () => void
  handleFinish: () => void
}

const DivStyled = styled.div`
  width: 5px;
  height: auto;
  display: inline-block;
`
const logger = getLogger('Market::Buy')

const Buy = (props: Props) => {
  const context = useConnectedWeb3Context()

  const { balance, marketAddress } = props
  const [status, setStatus] = useState<Status>(Status.Ready)
  const [amount, setAmount] = useState<number>(0)
  const [outcome, setOutcome] = useState(OutcomeSlots.Yes)
  const [cost, setCost] = useState<BigNumber>(new BigNumber(0))

  const handleChangeOutcome = async (e: any) => {
    setOutcome(e.target.value as OutcomeSlots)
  }

  const renderTableHeader = ['Outcome', 'Probabilities', 'Current Price'].map((value, index) => {
    return <th key={index}>{value}</th>
  })

  const renderTableData = balance.map((balanceItem: BalanceItems, index: number) => {
    const { outcomeName, probability, currentPrice } = balanceItem
    const defaultChecked = outcomeName === OutcomeSlots.Yes

    return (
      <tr key={index}>
        <td>
          <input
            type="radio"
            value={outcomeName}
            defaultChecked={defaultChecked}
            name="outcome"
            onChange={(e: any) => handleChangeOutcome(e)}
          />{' '}
          {outcomeName}
        </td>
        <td>{probability} %</td>
        <td>{currentPrice} DAI</td>
      </tr>
    )
  })

  const handleChangeAmount = async (event: any) => {
    event.persist()
    const provider = context.library

    const value = +event.target.value

    const balanceItem: BalanceItems | undefined = balance.find((balanceItem: BalanceItems) => {
      return balanceItem.outcomeName === outcome
    })

    const divisor: number = balanceItem ? +balanceItem.currentPrice : 1
    const amount: number = value / divisor
    setAmount(amount)

    const marketMakerService = new MarketMakerService(marketAddress)
    const outcomeTokenCost = await marketMakerService.calculateNetCost(provider, [amount, 0])
    const fee: BigNumber = await marketMakerService.calculateMarketFee(provider, outcomeTokenCost)
    const cost = fee.add(outcomeTokenCost)
    setCost(cost)
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

      const costInWei = ethers.utils.bigNumberify(cost).mul(ethers.constants.WeiPerEther)
      const hasEnoughAlowance = await daiService.hasEnoughAllowance(
        provider,
        user,
        marketMakerFactoryAddress,
        costInWei,
      )

      if (!hasEnoughAlowance) {
        await daiService.approve(provider, marketMakerFactoryAddress, costInWei)
      }

      await marketMakerService.trade(provider, [amount, 0])

      setStatus(Status.Ready)
      props.handleFinish()
    } catch (err) {
      setStatus(Status.Error)
      logger.log(`Error trying to buy: ${err.message}`)
    }
  }

  const disabled = status !== Status.Ready && status !== Status.Error

  return (
    <>
      <h6>Choose the shares you want to buy</h6>
      <table>
        <tbody>
          <tr>{renderTableHeader}</tr>
          {renderTableData}
        </tbody>
      </table>
      Amount
      <input type="number" onChange={(e: any) => handleChangeAmount(e)}></input>DAI
      <h6>Totals</h6>
      <p>You spend: {cost.toString()} DAI</p>
      <p>&quot;Yes&quot; shares you get 1 shares</p>
      <p>1 shares can be redeemed for 1 DAI in case it represents the final outcome.</p>
      <p>Status: {status}</p>
      <div className="row right">
        <Button disabled={disabled} onClick={() => props.handleBack()}>
          Back
        </Button>
        <DivStyled />
        <Button disabled={disabled} onClick={() => finish()}>
          Finish
        </Button>
      </div>
    </>
  )
}

export { Buy }
