import { BigNumber } from 'ethers/utils'
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import styled from 'styled-components'

<<<<<<< HEAD
import { useConnectedWeb3Context } from '../../../../contexts'
import { useGraphMarketsFromQuestion } from '../../../../hooks/graph/useGraphMarketsFromQuestion'
import { useTheme } from '../../../../hooks/useTheme'
=======
import { STANDARD_DECIMALS } from '../../../../common/constants'
import { useConnectedWeb3Context, useContracts } from '../../../../hooks'
import { useGraphMarketsFromQuestion } from '../../../../hooks/useGraphMarketsFromQuestion'
>>>>>>> 20dcca21fe3d9821237b0e27036eeeb48301430f
import { useWindowDimensions } from '../../../../hooks/useWindowDimensions'
import { getContractAddress, getNativeAsset, getWrapToken } from '../../../../util/networks'
<<<<<<< HEAD
import { getInitialCollateral, getMarketRelatedQuestionFilter, onChangeMarketCurrency } from '../../../../util/tools'
=======
import { formatBigNumber, getMarketRelatedQuestionFilter, onChangeMarketCurrency } from '../../../../util/tools'
>>>>>>> 20dcca21fe3d9821237b0e27036eeeb48301430f
import { MarketMakerData, MarketState, Token } from '../../../../util/types'
import { SubsectionTitleWrapper } from '../../../common'
import { AdditionalMarketData } from '../additional_market_data'
import { CurrencySelector } from '../currency_selector'
import { MarketData } from '../market_data'
import { ProgressBar } from '../progress_bar'
import { ProgressBarToggle } from '../progress_bar/toggle'

const SubsectionTitleLeftWrapper = styled.div`
  display: flex;
  align-items: center;
  @media (max-width: ${props => props.theme.themeBreakPoints.sm}) {
    flex-grow: 1;
  }
  & > * + * {
    margin-left: 12px;
  }
`

const MarketCurrencySelector = styled(CurrencySelector)`
  .dropdownItems {
    min-width: auto;
  }
`
interface Props {
  marketMakerData: MarketMakerData
  collateral: BigNumber
}

const MarketTopDetailsClosed: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()
  const theme = useTheme()
  const { networkId, relay } = context
  const { marketMakerData } = props
  const history = useHistory()

  const { width } = useWindowDimensions()
  const isMobile = width <= parseInt(theme.themeBreakPoints.sm)

  const {
    address,
    answerFinalizedTimestamp,
    arbitrator,
    collateralVolume,
    creationTimestamp,
    curatedByDxDao,
    curatedByDxDaoOrKleros,
    lastActiveDay,
    question,
    runningDailyVolumeByHour,
    submissionIDs,
  } = marketMakerData
  const { title } = question
  const ovmAddress = getContractAddress(networkId, 'omenVerifiedMarkets')

  const collateral = getInitialCollateral(networkId, marketMakerData.collateral, relay)

  const [showingProgressBar, setShowingProgressBar] = useState(false)
  const [liquidity, setLiquidity] = useState(new BigNumber(0))

  const creationDate = new Date(1000 * parseInt(creationTimestamp))

<<<<<<< HEAD
  const formattedLiquidity: number = scaledLiquidityParameter ? scaledLiquidityParameter : 0
=======
  const contracts = useContracts(context)
  const { buildMarketMaker } = contracts
  const marketMaker = buildMarketMaker(address)

  useEffect(() => {
    const getLiquidity = async () => {
      setLiquidity(await marketMaker.getTotalSupply())
    }
    marketMaker && getLiquidity()
    // eslint-disable-next-line
  }, [])

  const formattedLiquidity: string = formatBigNumber(liquidity, STANDARD_DECIMALS, 2)
>>>>>>> 20dcca21fe3d9821237b0e27036eeeb48301430f

  const isPendingArbitration = question.isPendingArbitration
  const arbitrationOccurred = question.arbitrationOccurred

  const { markets: marketsRelatedQuestion } = useGraphMarketsFromQuestion(question.id)

  const toggleProgressBar = () => {
    setShowingProgressBar(!showingProgressBar)
  }

  const nativeAssetAddress = getNativeAsset(networkId, relay).address.toLowerCase()
  const wrapTokenAddress = getWrapToken(networkId).address.toLowerCase()
  const filter = getMarketRelatedQuestionFilter(marketsRelatedQuestion, networkId)

  return (
    <>
      <SubsectionTitleWrapper>
        <SubsectionTitleLeftWrapper>
          {marketsRelatedQuestion.length > 1 && (
            <MarketCurrencySelector
              addNativeAsset
              context={context}
              currency={collateral.address === wrapTokenAddress ? nativeAssetAddress : collateral.address}
              disabled={false}
              filters={filter}
              onSelect={(currency: Token | null) =>
                onChangeMarketCurrency(marketsRelatedQuestion, currency, collateral, networkId, history)
              }
              placeholder=""
            />
          )}
          {(!isMobile || marketsRelatedQuestion.length === 1) && (
            <ProgressBarToggle
              active={showingProgressBar}
              state={'closed'}
              templateId={question.templateId}
              toggleProgressBar={toggleProgressBar}
            ></ProgressBarToggle>
          )}
        </SubsectionTitleLeftWrapper>
      </SubsectionTitleWrapper>
      {showingProgressBar && (
        <ProgressBar
          answerFinalizedTimestamp={answerFinalizedTimestamp}
          arbitrationOccurred={arbitrationOccurred}
          bondTimestamp={question.currentAnswerTimestamp}
          creationTimestamp={creationDate}
          pendingArbitration={isPendingArbitration}
          resolutionTimestamp={question.resolution}
          state={MarketState.closed}
        ></ProgressBar>
      )}
      <MarketData
        answerFinalizedTimestamp={marketMakerData.answerFinalizedTimestamp}
        collateralVolume={collateralVolume}
        currency={collateral}
        lastActiveDay={lastActiveDay}
        liquidity={formattedLiquidity}
        resolutionTimestamp={question.resolution}
        runningDailyVolumeByHour={runningDailyVolumeByHour}
      ></MarketData>
      <AdditionalMarketData
        address={address}
        arbitrator={arbitrator}
        category={question.category}
        collateral={collateral}
        curatedByDxDao={curatedByDxDao}
        curatedByDxDaoOrKleros={curatedByDxDaoOrKleros}
        id={question.id}
        oracle="Reality.eth"
        ovmAddress={ovmAddress}
        submissionIDs={submissionIDs}
        title={title}
      ></AdditionalMarketData>
    </>
  )
}

export { MarketTopDetailsClosed }
