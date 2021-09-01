import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { RouteComponentProps, useHistory } from 'react-router'

import { ProposalDetailsView } from '../../components/guild/proposal_details_view_container'
import { useConnectedWeb3Context } from '../../contexts'
import { useGraphMarketMakerData, useGuildProposals } from '../../hooks'
import { Proposal } from '../../services/guild'

interface RouteParams {
  id: string
}

export const ProposalDetailsPage = (props: RouteComponentProps<RouteParams>) => {
  const { networkId } = useConnectedWeb3Context()

  const history = useHistory()

  const { proposals } = useGuildProposals()

  const proposalId = props.match.params.id
  const [isScalar, setIsScalar] = useState(false)
  const [proposal, setProposal] = useState<Proposal>()

  // eslint-disable-next-line
  const { marketMakerData } = useGraphMarketMakerData(proposal ? proposal.description : '', networkId)

  useEffect(() => {
    if (proposals.length) {
      const proposal = proposals.find(proposal => proposal.id === proposalId)
      setProposal(proposal)
    }
  }, [proposals, proposalId])

  const proposalEndDate = proposal && new Date(proposal.endTime.toNumber() * 1000)
  // eslint-disable-next-line
  const formattedProposalEndDate = moment(proposalEndDate).fromNow(true)

  const back = () => history.push('/guild')

  //logic
  const dummyDataPassed = {
    amount: '500.00 OMN',
    apy: '360%',
    back,
    duration: '32 days',
    marketDetails:
      'What will the June 2021 CME/Globex S&P500 e-mini terminate at? https://www.cmegroup.com/trading/equity-index/us-index/e-mini-sandp500_quotes_globex.html',
    scaleValue: 0.9,
    liqudiity: '15,000.00 DAI',
    totalVolume: '4540.00 DAI',
    volume: '120.00 DAI',
    closingDate: '12th January 2021 at 00:00 UTC',
    closingIn: '32 days',
    apyTwo: '24.53%',
    verified: true,
    isScalar: isScalar,
    setIsScalar: setIsScalar,
  }
  return <ProposalDetailsView {...dummyDataPassed} />
}
