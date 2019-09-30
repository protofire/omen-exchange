import React from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import { Link } from 'react-router-dom'
import { ethers } from 'ethers'
import { BigNumber } from 'ethers/utils'

import { LinkSpan } from '../../../common/link_span'
import { formatDate } from '../../../../util/tools'

interface Props {
  values: {
    question: string
    category: string
    resolution: Date | null
    spread: string
    funding: BigNumber
    outcomeValueOne: string
    outcomeValueTwo: string
    outcomeProbabilityOne: string
    outcomeProbabilityTwo: string
  }
  marketMakerAddress: string | null
}

const ResumeMarketStep = (props: Props) => {
  const { marketMakerAddress, values } = props
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

  const resolutionDate = resolution && formatDate(resolution)

  const marketMakerURL = `${window.location.protocol}//${window.location.hostname}/view/${marketMakerAddress}`

  return (
    <>
      <h4>Your new market has been created!</h4>
      <h5>You can access it thought this URL, don&apos;t miss it</h5>
      <div className="row">
        <div className="col">
          <Link target="_blank" to={`/view/${marketMakerAddress}`}>
            {marketMakerURL}
          </Link>
        </div>
        <div className="col">
          <CopyToClipboard text={marketMakerURL}>
            <LinkSpan>Copy to clipboard</LinkSpan>
          </CopyToClipboard>
        </div>
      </div>
      <h5>Details</h5>
      <p>
        Question: <i>{question}</i>
      </p>
      <p>
        Oracle:{' '}
        <i>The market is resolved using realit.io oracle using the dxDAO as final arbitrator.</i>
      </p>
      <p>
        Category: <i>{category}</i>
      </p>
      <p>
        Resolution date: <i>{resolutionDate}</i>
      </p>
      <p>
        Spread/Fee: <i>{spread} %</i>
      </p>
      <p>
        Funding: <i>{ethers.utils.formatUnits(funding, 3)} DAI</i>
      </p>
      <p>Outcomes:</p>
      <p>
        <i>
          {outcomeValueOne} - {outcomeProbabilityOne} %
        </i>
      </p>
      <p>
        <i>
          {outcomeValueTwo} - {outcomeProbabilityTwo} %
        </i>
      </p>

      <div className="row center">
        <Link to={`/view/${marketMakerAddress}`}>Go to Market</Link>
      </div>
    </>
  )
}

export { ResumeMarketStep }
