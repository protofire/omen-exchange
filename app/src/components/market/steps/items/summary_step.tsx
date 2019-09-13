import React, { Component } from 'react'
import moment from 'moment'

import { Button } from '../../../common/index'

interface Props {
  back: () => void
  submit: () => void
  values: {
    question: string
    category: string
    resolution: Date | null
    spread: string
    funding: string
    outcomeValueOne: string
    outcomeValueTwo: string
    outcomeProbabilityOne: string
    outcomeProbabilityTwo: string
  }
}

class SummaryStep extends Component<Props> {
  back = () => {
    this.props.back()
  }

  submit = () => {
    this.props.submit()
  }

  render() {
    const { values } = this.props
    const {
      question,
      category,
      resolution,
      spread,
      funding,
      outcomeValueOne,
      outcomeValueTwo,
      outcomeProbabilityOne,
      outcomeProbabilityTwo,
    } = values

    const resolutionDate = resolution && moment(resolution).format('MM-DD-YYYY')

    return (
      <>
        <h3>
          Please check all the information is correct. You can go back and edit anything you need.
          If everything is OK proceed to create the new market.
        </h3>
        <div>Question: {question}</div>
        <div>Oracle: Lorem ipsum oracle</div>
        <div>Category: {category}</div>
        <div>Spread/Fee: {spread}</div>
        <div>Funding: {funding}</div>
        <div>Resolution date: {resolutionDate}</div>
        <div>Outcomes:</div>
        <div>
          {outcomeValueOne} - {outcomeProbabilityOne}
          {outcomeValueTwo} - {outcomeProbabilityTwo}
        </div>
        <Button onClick={this.back}>Back</Button>
        <Button onClick={this.submit}>Create Market</Button>
      </>
    )
  }
}

export { SummaryStep }
