import React from 'react'
import styled from 'styled-components'

import { Button } from '../components/button'
import { ButtonType } from '../components/button/button_styling_types'
import { MarketCard } from '../components/market/market_card'
// import { useConnectedWeb3Context } from '../contexts/connectedWeb3'
// import { useMarkets } from '../hooks/market_data/useMarkets'
// import { RemoteData } from '../util/remote_data'
import { MarketMakerData } from '../util/types'

type Props = {
  fetchGraphMarketMakerData: () => Promise<void>
  marketMakerData: MarketMakerData
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
  flex-wrap: wrap;
`

const ProposalTitle = styled.div`
  font-size: 22px;
  font-weight: 500;
  line-height: 26px;
  margin-bottom: 8px;
`

const ProposalSubtitle = styled.div`
  font-size: 14px;
  font-weight: 400;
  line-height: 18px;
  color: #86909e;
`

const ProposalButton = styled(Button)`
  @media (max-width: ${props => props.theme.themeBreakPoints.sm}) {
    margin-top: 24px;
  }
`

const MarketCardsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  width: 100%;
  margin: 20px 0px;
`

// eslint-disable-next-line
const GuildContainer: React.FC<Props> = props => {
  // const context = useConnectedWeb3Context()

  // const [markets, setMarkets] = useState<RemoteData<MarketMakerDataItem[]>>(RemoteData.notAsked())

  // const cpkAddress = context.cpk?.address

  // const PAGE_SIZE = 12
  // const [pageIndex, setPageIndex] = useState(0)
  // const feeBN = ethers.utils.parseEther('' + MAX_MARKET_FEE / Math.pow(10, 2))

  // const knownArbitrators = []

  // const marketsQueryVariables = {
  //   first: PAGE_SIZE,
  //   skip: pageIndex,
  //   accounts: cpkAddress ? [cpkAddress] : null,
  //   account: (cpkAddress && cpkAddress.toLowerCase()) || '',
  //   fee: feeBN.toString(),
  //   now: +(new Date().getTime() / 1000).toFixed(0),
  //   knownArbitrators,
  // }

  // const { error, loading, markets: fetchedMarkets, moreMarkets } = useMarkets(marketsQueryVariables)

  // const { data: fetchedCategories, error: categoriesError, loading: categoriesLoading } = useQuery<
  //   GraphResponseCategories
  // >(queryCategories, {
  //   notifyOnNetworkStatusChange: true,
  // })

  return (
    <GuildPageWrapper>
      <ProposalHeadingWrapper>
        <div>
          <ProposalTitle>Proposed Liquidity Rewards</ProposalTitle>
          <ProposalSubtitle>Reward liquidity providers of popular omen markets with 500 OMN tokens</ProposalSubtitle>
        </div>
        <ProposalButton buttonType={ButtonType.primary}>Propose Liq. Rewards</ProposalButton>
      </ProposalHeadingWrapper>
      <MarketCardsWrapper>
        <MarketCard />
        <MarketCard />
        <MarketCard />
      </MarketCardsWrapper>
    </GuildPageWrapper>
  )
}

export { GuildContainer }
