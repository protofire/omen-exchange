import React, { useState } from 'react'
import styled from 'styled-components'
import { OutcomeSlots, Status } from '../../../util/types'
import { Button, Textfield } from '../../common'
import { ButtonContainer } from '../../common/button_container'
import { ButtonLink } from '../../common/button_link'
import { FormLabel } from '../../common/form_label'
import { FormRow } from '../../common/form_row'
import { RadioInput } from '../../common/radio_input'
import { SubsectionTitle } from '../../common/subsection_title'
import { Table, TD, TH, THead, TR } from '../../common/table'
import { TextfieldCustomPlaceholder } from '../../common/textfield_custom_placeholder'
import { ViewCard } from '../view_card'
// import { FullLoading } from '../../common/full_loading'

interface Props {
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

const Sell = (props: Props) => {
  const [outcome, setOutcome] = useState<OutcomeSlots>(OutcomeSlots.Yes)
  //TODO: Fix this
  // const status = Status.Ready

  const TableHead = ['Outcome', 'Probabilities', 'Current Price', 'Shares']
  const TableCellsAlign = ['left', 'right', 'right', 'right']

  const handleChangeOutcome = async (e: any) => {
    const outcomeSelected: OutcomeSlots = e.target.value
    setOutcome(outcomeSelected)
  }

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

  //TODO: Get real data
  const balance = [
    {
      outcomeName: 'Yes',
      probability: '35',
      currentPrice: '75',
      shares: '50',
    },
    {
      outcomeName: 'No',
      probability: '75',
      currentPrice: '35',
      shares: '25',
    },
  ]
  const renderTableData = balance.map((balanceItem: any, index: number) => {
    const { outcomeName, probability, currentPrice, shares } = balanceItem

    return (
      <TR key={index}>
        <TD textAlign={TableCellsAlign[0]}>
          <RadioContainer>
            <RadioInputStyled
              checked={outcome === outcomeName}
              name="outcome"
              onChange={(e: any) => handleChangeOutcome(e)}
              value={outcomeName}
            />
            {outcomeName}
          </RadioContainer>
        </TD>
        <TD textAlign={TableCellsAlign[1]}>{probability} %</TD>
        <TD textAlign={TableCellsAlign[2]}>
          {currentPrice} <strong>DAI</strong>
        </TD>
        <TD textAlign={TableCellsAlign[3]}>{shares}</TD>
      </TR>
    )
  })

  return (
    <>
      <ViewCard>
        <SubsectionTitle>Choose the shares you want to sell</SubsectionTitle>
        <TableStyled head={renderTableHeader()}>{renderTableData}</TableStyled>
        <AmountWrapper
          formField={
            <TextfieldCustomPlaceholder
              formField={
                <Textfield min={0} name="amount" onChange={(e: any) => {}} type="number" />
              }
              placeholderText="Shares"
            />
          }
          note={[
            'You will be charged an extra 1% trade fee of ',
            <strong key="1">{true ? '0' : 'PUT VALUE HERE DAI'}</strong>,
          ]}
          title={'Amount'}
          tooltipText={'Transaction fees.'}
        />
        <FormLabelStyled>Totals</FormLabelStyled>
        <TableStyled>
          <TR>
            <TD>Total DAI Return</TD>
            <TD textAlign="right">
              150,75 <strong>DAI</strong>
            </TD>
          </TR>
        </TableStyled>
        <ButtonContainer>
          <ButtonLinkStyled onClick={() => props.handleBack()}>‹ Back</ButtonLinkStyled>
          <Button onClick={() => props.handleFinish()}>Finish</Button>
        </ButtonContainer>
      </ViewCard>
      {/* TODO: Fix this */}
      {/* {status === Status.Loading ? <FullLoading /> : null} */}
    </>
  )
}

export { Sell }
