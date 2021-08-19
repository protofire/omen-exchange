import { BigNumber } from 'ethers/utils'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import { ConnectedWeb3Context } from '../../contexts'
import { OmenGuildService } from '../../services/guild'
import { getLogger } from '../../util/logger'
import { RemoteData } from '../../util/remote_data'
import { MarketFilters, MarketMakerDataItem, TransactionStep } from '../../util/types'
import { Button } from '../button'
import { ButtonType } from '../button/button_styling_types'
import { IconBack } from '../common/icons'
import { MarketCard } from '../market/market_card'
import { ModalTransactionWrapper } from '../modal/modal_transaction'

const logger = getLogger('Guild::Propose')

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
  onLoadNextPage: () => void
  onLoadPrevPage: () => void
}

const GuildPageWrapper = styled.div`
  width: 100%;
  @media (max-width: ${props => props.theme.themeBreakPoints.xxl}) {
    padding: 0 14px;
  }
`

const ProposalHeadingWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
  @media (max-width: ${props => props.theme.themeBreakPoints.sm}) {
    flex-wrap: wrap;
  }
`

const ProposalTitle = styled.div`
  font-size: 22px;
  font-weight: 500;
  line-height: 26px;
  color: ${props => props.theme.text3};
`

const ProposalSubtitle = styled.div`
  font-size: ${props => props.theme.defaultSize};
  font-weight: 400;
  line-height: 18px;
  margin-top: 8px;
  color: ${props => props.theme.text2};
`

const ProposalButton = styled(Button)`
  @media (max-width: ${props => props.theme.themeBreakPoints.sm}) {
    margin-top: 24px;
    width: 100%;
  }
`

const MarketCardsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  width: 100%;
  margin-top: 12px;
  margin-bottom: 32px;
`

const OverviewWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  cursor: pointer;

  &:hover svg {
    path {
      fill: ${props => props.theme.primary1};
    }
  }

  &:hover div {
    color: ${props => props.theme.primary1};
  }
`

const StyledSvg = styled.svg`
  height: 12px;
  width: 18px;
  path {
    fill: ${props => props.theme.primary2};
  }
`

const OverviewTitle = styled.div`
  font-family: Roboto;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
  display: flex;
  align-items: center;
  letter-spacing: 0.2px;
  margin-left: 16px;
  color: ${props => props.theme.primary2};
`

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`

const ButtonNavWrapper = styled.div`
  display: flex;
`

const NextButton = styled(Button)`
  margin-left: 12px;
`

const GuildWrapper = (props: Props) => {
  const { context, count, isFiltering, markets, moreMarkets, onLoadNextPage, onLoadPrevPage, pageIndex } = props
  const { account, balances, cpk, library, networkId, setTxState, txHash, txState } = context

  const [propose, setPropose] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false)
  const [isTransactionProcessing, setIsTransactionProcessing] = useState<boolean>(false)

  // eslint-disable-next-line
  const [votes, setVotes] = useState(new BigNumber(0))
  // eslint-disable-next-line
  const [votesRequired, setVotesRequired] = useState(new BigNumber(0))

  useEffect(() => {
    const getVoteInfo = async () => {
      if (!cpk || !account) {
        return
      }
      const omen = new OmenGuildService(library, networkId)
      const [votes, required] = await Promise.all([await omen.votesOf(account), await omen.votesForCreation()])
      setVotes(votes)
      setVotesRequired(required)
    }

    getVoteInfo()
  }, [account, cpk, library, networkId])

  const toggle = () => {
    setPropose(!propose)
    setSelected([])
  }

  const select = (address: string) => {
    if (selected.includes(address)) {
      setSelected(selected.filter((addr: string) => addr !== address))
    } else {
      setSelected([...selected, address])
    }
  }

  const proposeLiquidityRewards = async () => {
    try {
      if (!cpk) {
        return
      }

      setIsTransactionProcessing(true)
      setTxState(TransactionStep.waitingConfirmation)
      setIsTransactionModalOpen(true)

      // await cpk.proposeLiquidityRewards()
      await new Promise(r => setTimeout(r, 3000))

      await balances.fetchBalances()
      setIsTransactionProcessing(false)
    } catch (err) {
      logger.error(err.message)
      setIsTransactionProcessing(false)
    }
  }

  const proposalButtonDisabled = (propose && !selected.length) || isTransactionProcessing // || votes.isZero() || votes.lt(votesRequired)
  const isPrevDisabled = pageIndex === 0
  const isNextDisabled = !moreMarkets
  return (
    <GuildPageWrapper>
      {propose && (
        <OverviewWrapper onClick={toggle}>
          <StyledSvg>
            <IconBack />
          </StyledSvg>
          <OverviewTitle>Guild Overview</OverviewTitle>
        </OverviewWrapper>
      )}
      <ProposalHeadingWrapper>
        {propose ? (
          <ProposalTitle>Choose Market for liquidity rewards</ProposalTitle>
        ) : (
          <div>
            <ProposalTitle>Proposed Liquidity Rewards</ProposalTitle>
            <ProposalSubtitle>Reward liquidity providers of popular omen markets with 500 OMN tokens</ProposalSubtitle>
          </div>
        )}

        <ProposalButton
          buttonType={ButtonType.primary}
          disabled={proposalButtonDisabled}
          onClick={propose ? proposeLiquidityRewards : toggle}
        >
          Propose Liq. Rewards
        </ProposalButton>
      </ProposalHeadingWrapper>
      {propose && (
        <MarketCardsWrapper>
          {!isFiltering &&
            RemoteData.hasData(markets) &&
            RemoteData.is.success(markets) &&
            markets.data.length > 0 &&
            markets.data.slice(0, count).map(item => {
              return (
                <MarketCard
                  active={selected.includes(item.address)}
                  key={item.address}
                  market={item}
                  onClick={() => select(item.address)}
                />
              )
            })}
        </MarketCardsWrapper>
      )}
      {propose && (
        <ButtonWrapper>
          <Button onClick={toggle}>Back</Button>
          <ButtonNavWrapper>
            <Button
              buttonType={isPrevDisabled ? ButtonType.primary : ButtonType.primaryLine}
              disabled={pageIndex === 0}
              onClick={onLoadPrevPage}
            >
              Prev
            </Button>
            <NextButton
              buttonType={isNextDisabled ? ButtonType.primary : ButtonType.primaryLine}
              disabled={!moreMarkets}
              onClick={onLoadNextPage}
            >
              Next
            </NextButton>
          </ButtonNavWrapper>
        </ButtonWrapper>
      )}
      <ModalTransactionWrapper
        confirmations={0}
        confirmationsRequired={0}
        isOpen={isTransactionModalOpen}
        message={'Propose Liquidity Rewards'}
        onClose={() => setIsTransactionModalOpen(false)}
        txHash={txHash}
        txState={txState}
      />
    </GuildPageWrapper>
  )
}

export { GuildWrapper }
