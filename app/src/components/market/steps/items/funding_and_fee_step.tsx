import React, { ChangeEvent, Component } from 'react'
import styled from 'styled-components'
import { BigNumber } from 'ethers/utils'

import { Button, Textfield, BigNumberInput } from '../../../common/index'
import { ButtonContainer } from '../../../common/button_container'
import { CreateCard } from '../../create_card'
import { FormRow } from '../../../common/form_row'
import { TextfieldCustomPlaceholder } from '../../../common/textfield_custom_placeholder'
import { ButtonLink } from '../../../common/button_link'

interface Props {
  back: () => void
  next: () => void
  values: {
    spread: string
    funding: BigNumber
  }
  handleChange: (event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => any
}

interface State {
  errors: string[]
}

const ButtonLinkStyled = styled(ButtonLink)`
  margin-right: auto;
`

const TextfieldStyledRight = styled<any>(Textfield)`
  text-align: right;
`

const InputBigNumberStyledRight = styled<any>(BigNumberInput)`
  text-align: right;
`

class FundingAndFeeStep extends Component<Props> {
  public state: State = {
    errors: [],
  }

  public back = () => {
    this.props.back()
  }

  public validate = (e: any) => {
    e.preventDefault()

    const { values } = this.props
    const { spread, funding } = values

    if (!spread || funding.isZero()) {
      const errors = []
      errors.push(`Please check the required fields`)
      this.setState({
        errors,
      })
    } else {
      this.props.next()
    }
  }

  render() {
    const { values, handleChange } = this.props
    const { spread, funding } = values

    return (
      <CreateCard>
        <FormRow
          formField={
            <TextfieldCustomPlaceholder
              disabled={true}
              formField={
                <TextfieldStyledRight
                  defaultValue={spread}
                  disabled
                  name="spread"
                  onChange={handleChange}
                  type="number"
                />
              }
              placeholderText="%"
            />
          }
          title={'Spread / Fee'}
          tooltipText={'The fee taken from every trade. Temporarily fixed at 1%.'}
        />
        <FormRow
          formField={
            <TextfieldCustomPlaceholder
              formField={
                <InputBigNumberStyledRight
                  name="funding"
                  value={funding}
                  onChange={handleChange}
                  decimals={18}
                />
              }
              placeholderText="DAI"
            />
          }
          title={'Funding'}
          tooltipText={'Initial funding to fund the market maker.'}
        />
        <ButtonContainer>
          <ButtonLinkStyled onClick={this.back}>‹ Back</ButtonLinkStyled>
          <Button disabled={!spread || funding.isZero()} onClick={this.validate}>
            Next
          </Button>
        </ButtonContainer>
      </CreateCard>
    )
  }
}

export { FundingAndFeeStep }
