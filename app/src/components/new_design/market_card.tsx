import React, { useState, useEffect } from 'react'
import moment from 'moment'
import { ethers } from 'ethers'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { ERC20Service } from './../../services/erc20'
import { calcPrice } from './../../util/tools'

interface Props {
  market: any
}

export const MarketCard = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { library: provider, account } = context
  const [amount, setAmount] = useState('')
  const [symbol, setSymbol] = useState('')

  const { market } = props
  const { question } = market.conditions[0]
  const endsIn = moment(new Date(question.openingTimestamp * 1000)).fromNow() // TODO Add function to calculate for past markets

  const { title, outcomes } = question
  const { collateralToken, collateralVolume, outcomeTokenAmounts } = market

  useEffect(() => {
    const setToken = async () => {
      if (!account) {
        return
      }
      const erc20Service = new ERC20Service(provider, account, collateralToken)
      const { symbol, decimals } = await erc20Service.getProfileSummary()

      const amount = ethers.utils.formatUnits(collateralVolume, decimals)

      setAmount(amount)
      setSymbol(symbol)
    }

    setToken()
  }, [collateralToken, account])

  const percentages = calcPrice(outcomeTokenAmounts)
  const indexMax = percentages.indexOf(Math.max(...percentages))

  return (
    <div>
      <div>
        <strong>{title}</strong>
      </div>
      <div>
        <span>{`${(percentages[indexMax] * 100).toFixed(2)}% ${outcomes[indexMax]} `}</span>·{' '}
        <span>
          {amount} {symbol} Volume
        </span>{' '}
        · <span>Ends in {endsIn}</span>
      </div>
    </div>
  )
}
