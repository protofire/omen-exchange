import { BigNumber } from 'ethers/utils'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { RouteComponentProps, useHistory } from 'react-router'

import { STANDARD_DECIMALS } from '../../common/constants'
import { ProposalDetailsView } from '../../components/guild/proposal_details_view_container'
import { useConnectedWeb3Context } from '../../contexts'
import { useGraphMarketMakerData, useGuildProposals } from '../../hooks'
import { Proposal } from '../../services/guild'
import { bigNumberToString } from '../../util/tools/formatting'
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

  if (!proposal || !marketMakerData) {
    return <div />
  }

  const proposalEndDate = proposal && new Date(proposal.endTime.toNumber() * 1000)
  const proposalTimeLeft = `${moment(proposalEndDate).fromNow(true)} left`

  const yesVotes = bigNumberToString(proposal.totalVotes || new BigNumber(0), STANDARD_DECIMALS)
  const liquidity = `${bigNumberToString(marketMakerData.totalPoolShares, marketMakerData.collateral.decimals)} ${
    marketMakerData.collateral.symbol
  }`
  const totalVolume = `${bigNumberToString(marketMakerData.collateralVolume, marketMakerData.collateral.decimals)} ${
    marketMakerData.collateral.symbol
  }`
  const volume = `${bigNumberToString(marketMakerData.dailyVolume, marketMakerData.collateral.decimals)} ${
    marketMakerData.collateral.symbol
  }`
  const marketDetails = marketMakerData.title
  const closingDate = `${moment(marketMakerData.openingTimestamp).format('DD MMM YYYY')} at ${moment(
    marketMakerData.openingTimestamp,
  ).format('H:mm zz')}`
  const back = () => history.push('/guild')

  //logic
  const dummyDataPassed = {
    amount: '500.00 OMN',
    apy: '360%',
    back,
    duration: '32 days',
    marketDetails,
    scaleValue: 0.9,
    liquidity,
    totalVolume,
    volume,
    closingDate,
    closingIn: '32 days',
    apyTwo: '24.53%',
    verified: true,
    isScalar: isScalar,
    proposalTimeLeft,
    yesVotes,
    setIsScalar: setIsScalar,
  }
  return <ProposalDetailsView {...dummyDataPassed} />
}
