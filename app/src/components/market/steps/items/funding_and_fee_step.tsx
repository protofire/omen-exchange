import React, { ChangeEvent, Component } from 'react'
import styled from 'styled-components'
import { CreateCard } from '../../create_card'
import { Button, Textfield } from '../../../common/index'
import { FormRow } from '../../../common/form_row'
import { ButtonContainer } from '../../../common/button_container'

interface Props {
  back: () => void
  next: () => void
  values: {
    spread: string
    funding: string
  }
  handleChange: (event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => any
}

interface State {
  errors: string[]
}

const Div = styled.div`
  height: 50px;
  display: flex;
  align-items: center;
`

const TextfieldStyled = styled(Textfield)`
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

    if (!spread || !funding) {
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
            <TextfieldStyled
              defaultValue={spread}
              disabled
              name="spread"
              onChange={handleChange}
              type="number"
            />
          }
          title={'Spread / Fee'}
          tooltipText={'The fee taken from every trade. Temporarily fixed at 1%.'}
        />
        <FormRow
          formField={
            <TextfieldStyled
              defaultValue={funding}
              name="funding"
              onChange={handleChange}
              type="number"
            />
          }
          title={'Funding'}
          tooltipText={'Initial funding to fund the market maker.'}
        />
        <ButtonContainer>
          <Button onClick={this.back}>Back</Button>
          <Button disabled={!spread || !funding} onClick={this.validate}>
            Next
          </Button>
        </ButtonContainer>
      </CreateCard>
    )
  }
}

export { FundingAndFeeStep }
