import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { BigNumber } from 'ethers/utils'
import { ethers } from 'ethers'

import { BalanceItems, OutcomeSlots, Status } from '../../../util/types'
import { Button, BigNumberInput } from '../../common'
import { ERC20Service, MarketMakerService } from '../../../services'
import { SubsectionTitle } from '../../common/subsection_title'
import { Table, TD, TH, THead, TR } from '../../common/table'
import { ViewCard } from '../view_card'
import { computePriceAfterTrade } from '../../../util/tools'
import { formatBN } from '../../../util/tools'
import { getContractAddress } from '../../../util/addresses'
import { getLogger } from '../../../util/logger'
import { useConnectedWeb3Context } from '../../../hooks/connectedWeb3'
import { Well } from '../../common/well'
import { FullLoading } from '../../common/full_loading'
import { ButtonContainer } from '../../common/button_container'
import { ButtonLink } from '../../common/button_link'
import { RadioInput } from '../../common/radio_input'
import { FormRow } from '../../common/form_row'
import { FormLabel } from '../../common/form_label'
import { TextfieldCustomPlaceholder } from '../../common/textfield_custom_placeholder'
import { BigNumberInputReturn } from '../../common/big_number_input'

interface Props {
  balance: BalanceItems[]
  funding: BigNumber
  handleBack: () => void
  handleFinish: () => void
  marketAddress: string
}

const ButtonLinkStyled = styled(ButtonLink)`
  margin-right: auto;
`

const RadioContainer = styled.label`
  align-items: center;
  display: flex;
  white-space: nowrap;
`

const RadioInputStyled = styled(RadioInput)`
  margin-right: 6px;
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

  const { balance, marketAddress, funding } = props

  const [status, setStatus] = useState<Status>(Status.Ready)
  const [outcome, setOutcome] = useState<OutcomeSlots>(OutcomeSlots.Yes)
  const [cost, setCost] = useState<BigNumber>(new BigNumber(0))
  const [tradedShares, setTradedShares] = useState<BigNumber>(new BigNumber(0))
  const [value, setValue] = useState<BigNumber>(new BigNumber(0))

  const TableHead = ['Outcome', 'Probabilities', 'Current Price', 'Price after trade']
  const TableCellsAlign = ['left', 'right', 'right', 'right']

  const renderTableHeader = () => {
    return (
      <THead>
        <TR>
          {TableHead.map((value, index) => {
            return (
              <TH textAlign={TableCellsAlign[index]} key={index}>
                {value}
              </TH>
            )
          })}
        </TR>
      </THead>
    )
  }

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

  useEffect(() => {
    const balanceItemFound: BalanceItems | undefined = balance.find((balanceItem: BalanceItems) => {
      return balanceItem.outcomeName === outcome
    })

    const valueNumber = +ethers.utils.formatUnits(value, 18)

    const price = balanceItemFound ? +balanceItemFound.currentPrice : 1
    const amount = valueNumber / price

    const amountInWei = ethers.utils
      .bigNumberify(Math.round(10000 * amount))
      .mul(ethers.constants.WeiPerEther)
      .div(10000)

    setTradedShares(amountInWei)

    const costWithFee = ethers.utils
      .bigNumberify(Math.round(valueNumber * 1.01 * 10000))
      .mul(ethers.constants.WeiPerEther)
      .div(10000)
    setCost(costWithFee)
  }, [outcome, value, balance])

  const renderTableData = balance.map((balanceItem: BalanceItems, index: number) => {
    const { outcomeName, probability, currentPrice } = balanceItem

    return (
      <TR key={index}>
        <TD textAlign={TableCellsAlign[0]}>
          <RadioContainer>
            <RadioInputStyled
              checked={outcome === outcomeName}
              name="outcome"
              onChange={(e: any) => setOutcome(e.target.value)}
              value={outcomeName}
            />
            {outcomeName}
          </RadioContainer>
        </TD>
        <TD textAlign={TableCellsAlign[1]}>{probability} %</TD>
        <TD textAlign={TableCellsAlign[2]}>
          {currentPrice} <strong>DAI</strong>
        </TD>
        <TD textAlign={TableCellsAlign[3]}>
          {pricesAfterTrade[index].toFixed(4)} <strong>DAI</strong>
        </TD>
      </TR>
    )
  })

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
        // add 10% to the approved amount because there can be precision errors
        // this can be improved if, instead of adding the 1% fee manually in the front, we use the `calcMarketFee`
        // contract method and add it to the result of `calcNetCost` result
        const costWithErrorMargin = cost.mul(11000).div(10000)
        await daiService.approve(provider, marketAddress, costWithErrorMargin)
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
      <ViewCard>
        <SubsectionTitle>Choose the shares you want to buy</SubsectionTitle>
        <TableStyled head={renderTableHeader()}>{renderTableData}</TableStyled>
        <AmountWrapper
          formField={
            <TextfieldCustomPlaceholder
              formField={
                <BigNumberInput
                  name="amount"
                  value={value}
                  onChange={(e: BigNumberInputReturn) => setValue(e.value)}
                  decimals={18}
                />
              }
              placeholderText="DAI"
            />
          }
          note={[
            'You will be charged an extra 1.01% trade fee of ',
            <strong key="1">{cost.isZero() ? '0' : formatBN(cost.sub(value))}</strong>,
          ]}
          title={'Amount'}
          tooltipText={'Transaction fees.'}
        />
        <FormLabelStyled>Totals</FormLabelStyled>
        <TableStyled>
          <TR>
            <TD>You spend</TD>
            <TD textAlign="right">
              {formatBN(cost)} <strong>DAI</strong>
            </TD>
          </TR>
          <TR>
            <TD>&quot;{outcome}&quot; shares you get</TD>
            <TD textAlign="right">
              {formatBN(tradedShares)} <strong>shares</strong>
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
      {status === Status.Loading ? <FullLoading /> : null}
    </>
  )
}

export { Buy }
