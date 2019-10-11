import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { BigNumber } from 'ethers/utils'
import { ethers } from 'ethers'

import { BalanceItem, OutcomeSlot, OutcomeTableValue, Status } from '../../../util/types'
import { Button, BigNumberInput, OutcomeTable } from '../../common'
import { ButtonContainer } from '../../common/button_container'
import { ButtonLink } from '../../common/button_link'
import { FormLabel } from '../../common/form_label'
import { FormRow } from '../../common/form_row'
import { SubsectionTitle } from '../../common/subsection_title'
import { Table, TD, TR } from '../../common/table'
import { TextfieldCustomPlaceholder } from '../../common/textfield_custom_placeholder'
import { ViewCard } from '../../common/view_card'
import { MarketMakerService } from '../../../services'
import { useConnectedWeb3Context } from '../../../hooks/connectedWeb3'
import { getLogger } from '../../../util/logger'
import { BigNumberInputReturn } from '../../common/big_number_input'
import { FullLoading } from '../../common/full_loading'
import { computePriceAfterTrade } from '../../../util/tools'
import { useContracts } from '../../../hooks/useContracts'

interface Props {
  balance: BalanceItem[]
  funding: BigNumber
  marketMakerAddress: string
  handleBack: () => void
  handleFinish: () => void
}

const ButtonLinkStyled = styled(ButtonLink)`
  margin-right: auto;
`

const TableStyled = styled(Table)`
  margin-bottom: 30px;
`

const AmountWrapper = styled(FormRow)`
  margin-bottom: 30px;
  width: 100%;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    width: 50%;
  }
`

const FormLabelStyled = styled(FormLabel)`
  margin-bottom: 10px;
`
const logger = getLogger('Market::Sell')

const Sell = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { conditionalTokens } = useContracts(context)

  const { balance, marketMakerAddress, funding } = props

  const [status, setStatus] = useState<Status>(Status.Ready)
  const [balanceItem, setBalanceItem] = useState<BalanceItem>()
  const [outcome, setOutcome] = useState<OutcomeSlot>(OutcomeSlot.Yes)
  const [amountShares, setAmountShares] = useState<BigNumber>(new BigNumber(0))
  const [tradedDAI, setTradedDAI] = useState<BigNumber>(new BigNumber(0))
  const [costFee, setCostFee] = useState<BigNumber>(new BigNumber(0))
  const [message, setMessage] = useState<string>('')

  const [tradeYes, tradeNo] =
    outcome === OutcomeSlot.Yes
      ? [amountShares.mul(-1), ethers.constants.Zero]
      : [ethers.constants.Zero, amountShares.mul(-1)]

  const holdingsYes = balance[0].holdings
  const holdingsNo = balance[1].holdings
  const pricesAfterTrade = computePriceAfterTrade(
    tradeYes,
    tradeNo,
    holdingsYes,
    holdingsNo,
    funding,
  )

  useEffect(() => {
    const balanceItemFound: BalanceItem | undefined = balance.find((balanceItem: BalanceItem) => {
      return balanceItem.outcomeName === outcome
    })
    setBalanceItem(balanceItemFound)

    const amountSharesInUnits = +ethers.utils.formatUnits(amountShares, 18)
    const individualPrice = balanceItemFound ? +balanceItemFound.currentPrice : 1
    const amountToSell = individualPrice * amountSharesInUnits

    const amountToSellInWei = ethers.utils
      .bigNumberify(Math.round(amountToSell * 10000))
      .mul(ethers.constants.WeiPerEther)
      .div(10000)

    const costFeeInWei = ethers.utils
      .bigNumberify(Math.round(amountToSell * 0.01 * 10000))
      .mul(ethers.constants.WeiPerEther)
      .div(10000)

    setCostFee(costFeeInWei)

    setTradedDAI(amountToSellInWei.sub(costFeeInWei))
  }, [outcome, amountShares, balance])

  const haveEnoughShares = balanceItem && amountShares.lte(balanceItem.shares)

  const finish = async () => {
    try {
      if (!haveEnoughShares) {
        throw new Error('There are not enough shares to sell')
      }

      setStatus(Status.Loading)
      setMessage(`Selling ${ethers.utils.formatUnits(amountShares, 18)} shares ...`)

      const provider = context.library

      const marketMaker = new MarketMakerService(marketMakerAddress, conditionalTokens, provider)

      const amountSharesNegative = amountShares.mul(-1)
      const outcomeValue =
        outcome === OutcomeSlot.Yes ? [amountSharesNegative, 0] : [0, amountSharesNegative]

      const isApprovedForAll = await conditionalTokens.isApprovedForAll(marketMakerAddress)

      if (!isApprovedForAll) {
        await conditionalTokens.setApprovalForAll(marketMakerAddress)
      }

      // TODO: TBD

      // await marketMaker.trade(outcomeValue)

      setStatus(Status.Ready)
      props.handleFinish()
    } catch (err) {
      setStatus(Status.Error)
      logger.log(`Error trying to sell: ${err.message}`)
    }
  }

  const disabled =
    (status !== Status.Ready && status !== Status.Error) ||
    amountShares.isZero() ||
    !haveEnoughShares

  return (
    <>
      <ViewCard>
        <SubsectionTitle>Choose the shares you want to sell</SubsectionTitle>
        <OutcomeTable
          balance={balance}
          pricesAfterTrade={pricesAfterTrade}
          outcomeSelected={outcome}
          outcomeHandleChange={(value: OutcomeSlot) => setOutcome(value)}
          disabledColumns={[OutcomeTableValue.Payout]}
        />
        <AmountWrapper
          formField={
            <TextfieldCustomPlaceholder
              formField={
                <BigNumberInput
                  name="amount"
                  value={amountShares}
                  onChange={(e: BigNumberInputReturn) => setAmountShares(e.value)}
                  decimals={18}
                />
              }
              placeholderText="Shares"
            />
          }
          note={[
            'You will be charged an extra 1% trade fee of ',
            <strong key="1">{ethers.utils.formatEther(costFee)}</strong>,
          ]}
          title={'Amount'}
          tooltipText={'Transaction fees.'}
        />
        <FormLabelStyled>Totals</FormLabelStyled>
        <TableStyled>
          <TR>
            <TD>Total DAI Return</TD>
            <TD textAlign="right">
              {ethers.utils.formatEther(tradedDAI)} <strong>DAI</strong>
            </TD>
          </TR>
        </TableStyled>
        <ButtonContainer>
          <ButtonLinkStyled onClick={() => props.handleBack()}>‹ Back</ButtonLinkStyled>
          <Button disabled={disabled} onClick={() => finish()}>
            Finish
          </Button>
        </ButtonContainer>
      </ViewCard>
      {status === Status.Loading ? <FullLoading message={message} /> : null}
    </>
  )
}

export { Sell }
