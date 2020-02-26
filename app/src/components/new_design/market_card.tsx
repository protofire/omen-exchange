import React, { useState, useEffect } from 'react'
import moment from 'moment'
import { ethers } from 'ethers'
import { useConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { ERC20Service } from './../../services/erc20'
interface Props {
  market: any
}

const SEPARATOR = '␟'

const parseQuestionTemplate = (templateId: string) => {
  if (templateId === '0x2') {
    return 'Binary'
  }
  throw new Error(`Invalid question template ${templateId}`)
}

export const MarketCard = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { library: provider, account } = context
  const [amount, setAmount] = useState('')
  const [symbol, setSymbol] = useState('')

  const { market } = props
  const { question } = market.conditions[0]
  const endsIn = moment(new Date(question.openingTimestamp * 1000)).fromNow()
  const [questionString, , category] = question.data.split(SEPARATOR) // if category undefined => Misc
  const questionTemplate = parseQuestionTemplate(question.template.id)
  console.log(category, questionTemplate)
  const { collateralToken, collateralVolume } = market

  useEffect(() => {
    const setToken = async () => {
      console.log(provider, account)
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

  console.log(collateralToken)
  return (
    <div>
      <div>
        <strong>{questionString}</strong>
      </div>
      <div>
        <span>60% YES</span>·{' '}
        <span>
          {amount} {symbol} Volume
        </span>{' '}
        · <span>Ends in {endsIn}</span>
      </div>
    </div>
  )
}
