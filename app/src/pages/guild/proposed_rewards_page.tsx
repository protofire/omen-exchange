import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React, { useEffect, useState } from 'react'

import { ProposedRewardsView } from '../../components/guild/proposed_rewards_view'
import { ConnectedWeb3Context } from '../../contexts'
import { useGraphLiquidityMiningCampaigns } from '../../hooks'
import { OmenGuildService } from '../../services/guild'
import { getLogger } from '../../util/logger'
import { RemoteData } from '../../util/remote_data'
import { MarketFilters, MarketMakerDataItem, TransactionStep } from '../../util/types'

const logger = getLogger('Guild::ProposedRewardsPage')

interface Props {
  count: number
  context: ConnectedWeb3Context
  currentFilter: any
  isFiltering?: boolean
  fetchMyMarkets: boolean
  markets: RemoteData<MarketMakerDataItem[]>
  moreMarkets: boolean
  pageIndex: number
  onFilterChange: (filter: MarketFilters) => void
  onLoadNextPage: (size: number) => void
  onLoadPrevPage: (size: number) => void
}

const ProposedRewardsPage = (props: Props) => {
  const { context, currentFilter, markets, onFilterChange, onLoadNextPage, onLoadPrevPage } = props
  const { account, balances, cpk, library, networkId, relay, setTxState } = context

  const [propose, setPropose] = useState(false)
  const [selected, setSelected] = useState('')
  const [totalLocked, setTotalLocked] = useState(Zero)
  const [userLocked, setUserLocked] = useState(Zero)

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false)
  const [isTransactionProcessing, setIsTransactionProcessing] = useState<boolean>(false)

  const [votes, setVotes] = useState(new BigNumber(0))
  const [votesRequired, setVotesRequired] = useState(new BigNumber(0))
  const [totalRewards, setTotalRewards] = useState(Zero)

  const { liquidityMiningCampaigns } = useGraphLiquidityMiningCampaigns()

  const PAGE_SIZE = 6
  useEffect(() => {
    if (currentFilter.first !== PAGE_SIZE) {
      onFilterChange({ ...currentFilter, first: PAGE_SIZE })
    }
    // eslint-disable-next-line
  }, [currentFilter, markets])

  useEffect(() => {
    const getGuildInfo = async () => {
      if (!cpk || !account) {
        return
      }
      if (liquidityMiningCampaigns) {
        setTotalRewards(
          liquidityMiningCampaigns.reduce(
            (prev: BigNumber, { rewardAmounts }: any) => prev.add(rewardAmounts[0]),
            Zero,
          ),
        )
      }

      // const stakingService = new StakingService(library, cpk.address, liquidityMiningCampaign.id)
      // const claimableRewards = await stakingService.getClaimableRewards(cpk.address)

      const omen = new OmenGuildService(library, networkId)
      const [votes, required] = await Promise.all([await omen.votesOf(cpk.address), await omen.votesForCreation()])
      const fetchLockAddress = await omen.getUserAddress(cpk.address, relay)

      const locked = await omen.tokensLocked(fetchLockAddress)

      setUserLocked(locked.amount)
      const totalLocked = await omen.totalLocked()

      setTotalLocked(totalLocked)
      setVotes(votes)
      setVotesRequired(required)
    }

    getGuildInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, cpk, library, networkId, liquidityMiningCampaigns])

  const toggle = () => {
    setPropose(!propose)
    setSelected('')
  }

  const select = (address: string) => {
    setSelected(selected === address ? '' : address)
  }

  const proposeLiquidityRewards = async () => {
    try {
      if (!cpk) {
        return
      }

      const campaignAddress =
        liquidityMiningCampaigns && liquidityMiningCampaigns.find(campaign => campaign.fpmm.id)?.id

      if (!campaignAddress) {
        return
      }

      setIsTransactionProcessing(true)
      setTxState(TransactionStep.waitingConfirmation)
      setIsTransactionModalOpen(true)

      await cpk.proposeLiquidityRewards({ campaignAddress, marketMakerAddress: selected })
      await new Promise(r => setTimeout(r, 3000))

      await balances.fetchBalances()
      setIsTransactionProcessing(false)
    } catch (err) {
      logger.error(err.message)
      setIsTransactionProcessing(false)
    }
  }

  const next = () => {
    onLoadNextPage(PAGE_SIZE)
    setSelected('')
  }

  const prev = () => {
    onLoadPrevPage(PAGE_SIZE)
    setSelected('')
  }

  return (
    <ProposedRewardsView
      {...props}
      isTransactionModalOpen={isTransactionModalOpen}
      isTransactionProcessing={isTransactionProcessing}
      onLoadNextPage={next}
      onLoadPrevPage={prev}
      propose={propose}
      proposeLiquidityRewards={proposeLiquidityRewards}
      select={select}
      selected={selected}
      setIsTransactionModalOpen={setIsTransactionModalOpen}
      toggle={toggle}
      totalLocked={totalLocked}
      totalRewards={totalRewards}
      userLocked={userLocked}
      votes={votes}
      votesRequired={votesRequired}
    />
  )
}

export { ProposedRewardsPage }
