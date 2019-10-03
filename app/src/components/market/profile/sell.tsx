import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { BigNumber } from 'ethers/utils'
import { ethers } from 'ethers'

import { BalanceItems, OutcomeSlots, Status } from '../../../util/types'
import { Button, BigNumberInput } from '../../common'
import { ButtonContainer } from '../../common/button_container'
import { ButtonLink } from '../../common/button_link'
import { FormLabel } from '../../common/form_label'
import { FormRow } from '../../common/form_row'
import { RadioInput } from '../../common/radio_input'
import { SubsectionTitle } from '../../common/subsection_title'
import { Table, TD, TH, THead, TR } from '../../common/table'
import { TextfieldCustomPlaceholder } from '../../common/textfield_custom_placeholder'
import { ViewCard } from '../view_card'
import { MarketMakerService, ConditionalTokenService } from '../../../services'
import { useConnectedWeb3Context } from '../../../hooks/connectedWeb3'
import { getLogger } from '../../../util/logger'
import { BigNumberInputReturn } from '../../common/big_number_input'
import { FullLoading } from '../../common/full_loading'

interface Props {
  balance: BalanceItems[]
  funding: BigNumber
  marketAddress: string
  handleBack: () => void
  handleFinish: () => void
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
const logger = getLogger('Market::Sell')

const Sell = (props: Props) => {
  const context = useConnectedWeb3Context()

  const TableHead = ['Outcome', 'Probabilities', 'Current Price', 'Shares']
  const TableCellsAlign = ['left', 'right', 'right', 'right']

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

    const amountSharesInUnits = +ethers.utils.formatUnits(amountShares, 18)
    const individualPrice = balanceItemFound ? +balanceItemFound.currentPrice : 1
    const amountToSell = individualPrice * amountSharesInUnits

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

  const renderTableData = balance.map((balanceItem: BalanceItems, index: number) => {
    const { outcomeName, probability, currentPrice, shares } = balanceItem

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
        <TD textAlign={TableCellsAlign[3]}>{ethers.utils.formatUnits(shares, 18)}</TD>
      </TR>
    )
  })

  const haveEnoughShares = balanceItem && amountShares.lte(balanceItem.shares)
  const finish = async () => {
    try {
      if (!haveEnoughShares) {
        throw new Error('There are not enough shares to sell')
      }

      setStatus(Status.Loading)

      const provider = context.library
      const networkId = context.networkId

      const marketMakerService = new MarketMakerService(marketAddress)

      const amountSharesNegative = amountShares.mul(-1)
      const outcomeValue =
        outcome === OutcomeSlots.Yes ? [amountSharesNegative, 0] : [0, amountSharesNegative]

      await ConditionalTokenService.setApprovalForAll(marketAddress, provider, networkId)

      await marketMakerService.trade(provider, outcomeValue)

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
        <TableStyled head={renderTableHeader()}>{renderTableData}</TableStyled>
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
            'You will be charged an extra 1.01% trade fee of ',
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
      {status === Status.Loading ? <FullLoading /> : null}
    </>
  )
}

export { Sell }
