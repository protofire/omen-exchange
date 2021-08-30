import { BigNumber } from 'ethers/utils'
import React from 'react'
import styled from 'styled-components'

import { ConnectedWeb3Context } from '../../contexts'
import { TYPE } from '../../theme'
import { RemoteData } from '../../util/remote_data'
import { MarketFilters, MarketMakerDataItem } from '../../util/types'
import { Button } from '../button'
import { ButtonType } from '../button/button_styling_types'
import { IconArrowBack } from '../common/icons'
import { MarketCard } from '../market/market_card'
import { ModalTransactionWrapper } from '../modal/modal_transaction'

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

const ProposalButton = styled(Button)`
  @media (max-width: ${props => props.theme.themeBreakPoints.sm}) {
    margin-top: 24px;
    width: 100%;
  }
`

const MarketCardsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  margin-top: 12px;
  margin-bottom: 32px;

  & > div:not(:nth-child(1)):not(:nth-child(4)) {
    margin-left: 20px;
  }
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
  votes: BigNumber
  votesRequired: BigNumber
  isTransactionModalOpen: boolean
  isTransactionProcessing: boolean
  selected: string
  propose: boolean
  toggle: () => void
  select: (address: string) => void
  setIsTransactionModalOpen: (open: boolean) => void
  proposeLiquidityRewards: () => Promise<void>
}

const ProposedRewardsView = (props: Props) => {
  const {
    context,
    isTransactionModalOpen,
    isTransactionProcessing,
    markets,
    moreMarkets,
    onLoadNextPage,
    onLoadPrevPage,
    pageIndex,
    propose,
    proposeLiquidityRewards,
    select,
    selected,
    setIsTransactionModalOpen,
    toggle,
    votes,
    votesRequired,
  } = props
  const { networkId, txHash, txState } = context

  const proposalButtonDisabled =
    (propose && !selected.length) || isTransactionProcessing || votes.isZero() || votes.lt(votesRequired)
  const isPrevDisabled = pageIndex === 0
  const isNextDisabled = !moreMarkets

  return (
    <GuildPageWrapper>
      {propose && (
        <OverviewWrapper onClick={toggle}>
          <IconArrowBack color="#7986CB" />
          <TYPE.heading3 color="primary2" marginLeft={16}>
            Guild Overview
          </TYPE.heading3>
        </OverviewWrapper>
      )}
      <ProposalHeadingWrapper>
        {propose ? (
          <TYPE.heading1 color="text3">Choose Market for liquidity rewards</TYPE.heading1>
        ) : (
          <div>
            <TYPE.heading1 color="text3">Proposed Liquidity Rewards</TYPE.heading1>
            <TYPE.bodyRegular color="text2" marginTop={8}>
              Reward liquidity providers of popular omen markets with 500 OMN tokens
            </TYPE.bodyRegular>
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
          {RemoteData.hasData(markets) &&
            RemoteData.is.success(markets) &&
            markets.data.length > 0 &&
            markets.data.map(item => {
              return (
                <MarketCard
                  active={selected === item.address}
                  key={item.address}
                  market={item}
                  networkId={networkId}
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

export { ProposedRewardsView }
