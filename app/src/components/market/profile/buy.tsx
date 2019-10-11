import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { BigNumber } from 'ethers/utils'
import { ethers } from 'ethers'

import { BalanceItem, OutcomeSlot, Status, OutcomeTableValue } from '../../../util/types'
import { Button, BigNumberInput, OutcomeTable } from '../../common'
import { ERC20Service, MarketMakerService } from '../../../services'
import { SubsectionTitle } from '../../common/subsection_title'
import { Table, TD, TR } from '../../common/table'
import { ViewCard } from '../view_card'
import { computePriceAfterTrade } from '../../../util/tools'
import { getContractAddress } from '../../../util/addresses'
import { getLogger } from '../../../util/logger'
import { useConnectedWeb3Context } from '../../../hooks/connectedWeb3'
import { Well } from '../../common/well'
import { FullLoading } from '../../common/full_loading'
import { ButtonContainer } from '../../common/button_container'
import { ButtonLink } from '../../common/button_link'
import { FormRow } from '../../common/form_row'
import { FormLabel } from '../../common/form_label'
import { TextfieldCustomPlaceholder } from '../../common/textfield_custom_placeholder'
import { BigNumberInputReturn } from '../../common/big_number_input'
import { useContracts } from '../../../hooks/useContracts'

interface Props {
  balance: BalanceItem[]
  funding: BigNumber
  handleBack: () => void
  handleFinish: () => void
  marketAddress: string
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

const logger = getLogger('Market::Buy')

const Buy = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { conditionalTokens } = useContracts(context)

  const { balance, marketAddress, funding } = props

  const [status, setStatus] = useState<Status>(Status.Ready)
  const [outcome, setOutcome] = useState<OutcomeSlot>(OutcomeSlot.Yes)
  const [cost, setCost] = useState<BigNumber>(new BigNumber(0))
  const [tradedShares, setTradedShares] = useState<BigNumber>(new BigNumber(0))
  const [amount, setAmount] = useState<BigNumber>(new BigNumber(0))
  const [message, setMessage] = useState<string>('')

  const [tradeYes, tradeNo] =
    outcome === OutcomeSlot.Yes
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

  useEffect(() => {
    const balanceItemFound: BalanceItem | undefined = balance.find((balanceItem: BalanceItem) => {
      return balanceItem.outcomeName === outcome
    })

    const valueNumber = +ethers.utils.formatUnits(amount, 18)

    const price = balanceItemFound ? +balanceItemFound.currentPrice : 1
    const sharesAmount = valueNumber / price

    const sharesAmountInWei = ethers.utils
      .bigNumberify('' + Math.round(10000 * sharesAmount)) // cast to string to avoid overflows
      .mul(ethers.constants.WeiPerEther)
      .div(10000)

    setTradedShares(sharesAmountInWei)

    const costWithFee = ethers.utils
      .bigNumberify('' + Math.round(valueNumber * 1.01 * 10000)) // cast to string to avoid overflows
      .mul(ethers.constants.WeiPerEther)
      .div(10000)
    setCost(costWithFee)
  }, [outcome, amount, balance])

  const finish = async () => {
    try {
      setStatus(Status.Loading)
      setMessage(`Buying ${ethers.utils.formatUnits(tradedShares, 18)} shares ...`)

      const provider = context.library
      const networkId = context.networkId
      const user = await provider.getSigner().getAddress()

      const daiAddress = getContractAddress(networkId, 'dai')

      const marketMaker = new MarketMakerService(marketAddress, conditionalTokens, provider)
      const daiService = new ERC20Service(daiAddress)

      const hasEnoughAlowance = await daiService.hasEnoughAllowance(
        provider,
        user,
        marketAddress,
        cost,
      )

      if (!hasEnoughAlowance) {
        // add 10% to the approved amount because there can be precision errors
        // this can be improved if, instead of adding the 1% fee manually in the front, we use the `calcMarketFee`
        // contract method and add it to the result of `calcNetCost` result
        const costWithErrorMargin = cost.mul(11000).div(10000)
        await daiService.approve(provider, marketAddress, costWithErrorMargin)
      }

      //TODO: TBD
      await marketMaker.buy(amount, outcome)

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
      <ViewCard>
        <SubsectionTitle>Choose the shares you want to buy</SubsectionTitle>
        <OutcomeTable
          balance={balance}
          pricesAfterTrade={pricesAfterTrade}
          outcomeSelected={outcome}
          outcomeHandleChange={(value: OutcomeSlot) => setOutcome(value)}
          disabledColumns={[OutcomeTableValue.Shares, OutcomeTableValue.Payout]}
        />
        <AmountWrapper
          formField={
            <TextfieldCustomPlaceholder
              formField={
                <BigNumberInput
                  name="amount"
                  value={amount}
                  onChange={(e: BigNumberInputReturn) => setAmount(e.value)}
                  decimals={18}
                />
              }
              placeholderText="DAI"
            />
          }
          note={[
            'You will be charged an extra 1% trade fee of ',
            <strong key="1">
              {cost.isZero() ? '0' : ethers.utils.formatUnits(cost.sub(amount), 18)}
            </strong>,
          ]}
          title={'Amount'}
          tooltipText={'Transaction fees.'}
        />
        <FormLabelStyled>Totals</FormLabelStyled>
        <TableStyled>
          <TR>
            <TD>You spend</TD>
            <TD textAlign="right">
              {ethers.utils.formatUnits(cost, 18)} <strong>DAI</strong>
            </TD>
          </TR>
          <TR>
            <TD>&quot;{outcome}&quot; shares you get</TD>
            <TD textAlign="right">
              {ethers.utils.formatUnits(tradedShares, 18)} <strong>shares</strong>
            </TD>
          </TR>
        </TableStyled>
        <Well>
          <strong>1 shares</strong> can be redeemed for <strong>1 DAI</strong> in case it represents
          the final outcome.
        </Well>
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

export { Buy }
