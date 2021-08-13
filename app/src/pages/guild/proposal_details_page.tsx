import React, { useState } from 'react'

import { ProposalDetailsView } from '../../components/guild/proposal_details_view'

interface Props {
  amount: any
  apy: any
  duration: any
  marketDetails: any
  scaleValue: any
  liqudiity: any
  totalVolume: any
  volume: any
  closingDate: any
  closingIn: any
  apyTwo: any
  verified: any
}

export const ProposalDetailsPage = () => {
  const [someState, setState] = useState('separation of concerns')
  //logic
  const dummyDataPassed = {
    amount: '500.00 OMN',
    apy: '360%',
    duration: '32 days',
    marketDetails:
      'What will the June 2021 CME/Globex S&P500 e-mini terminate at? https://www.cmegroup.com/trading/equity-index/us-index/e-mini-sandp500_quotes_globex.html',
    scaleValue: '90.54',
    liqudiity: '15,000.00 DAI',
    totalVolume: '4540.00 DAI',
    volume: '120.00 DAI',
    closingDate: '12th January 2021 at 00:00 UTC',
    closingIn: '32 days',
    apyTwo: '24.53%',
    verified: true,
  }
  return <ProposalDetailsView {...dummyDataPassed} />
}
