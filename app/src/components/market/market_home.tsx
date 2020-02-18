import React, { useState } from 'react'
import styled from 'styled-components'

import { MarketWithExtraData, MarketData } from '../../util/types'
import { getDefaultArbitrator, getDefaultToken } from '../../util/networks'
import { BigNumber } from 'ethers/utils'

import { MarketFilter } from '../../util/market_filter'
import { RemoteData } from '../../util/remote_data'
import { Button, Categories } from '../common/index'
import { ListCard } from '../common/list_card'
import { ListItem } from '../common/list_item'
import { SelectOptions } from '../common/select_options'
import { CheckboxInput } from '../common/checkbox_input'
import { MARKET_FEE } from '../../common/constants'

import { SectionTitle } from '../common/section_title'
import { Filter } from '../common/filter'
import { ConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { LoadingItem } from '../common/loading_item'
import { FormRow } from '../common/form_row'
import { SearchInput } from '../common/search_input'

const FilterStyled = styled(Filter)``

const StyledRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  border-bottom: solid 1px #d5d5d5;
  padding: 10px 18px 6px;

  > * {
    margin: 0;
    flex: 1 0 auto;
  }

  p {
    font-size: 11px;
    color: #000000;
  }
`

const NoMarketsAvailable = styled(SectionTitle)`
  margin-top: 150px;
`

const StyledFormRow = styled(FormRow)`
  padding: 17px 18px 0;
  position: relative;

  .form-title {
    label {
      font-size: 18px;
      font-weight: 500;
      line-height: 1.33;
    }
  }

  &:not(:first-child) {
    padding-top: 0;
    margin-bottom: 5px;
    display: flex;
    flex-wrap: wrap;

    .form-title {
      flex: 1 0 100%;

      label {
        font-size: 15px;
      }
    }

    > div:not(.form-title) {
      flex: 1 0 auto;
      max-width: 100%;
      margin-bottom: 20px;

      label:not(.checkbox-label) {
        font-size: 11px;
        color: ${props => props.theme.textfield.placeholderColor};
      }

      @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
        max-width: 150px;
        margin-right: 67px;

        &:nth-child(4) {
          margin-right: 0;
        }
      }
    }
  }
`

const LoadingWrapper = styled.div`
  > div {
    position: static;
    height: auto;
    width: 100%;
    margin-top: 20px;
  }
`

interface Props {
  markets: RemoteData<MarketWithExtraData[]>
  count: number
  moreMarkets: boolean
  context: ConnectedWeb3Context
  currentFilter: MarketFilter
  onFilterChange: (filter: MarketFilter) => void
  onShowMore: () => void
}

export const MarketHome: React.FC<Props> = (props: Props) => {
  const { count, markets, context, currentFilter, onFilterChange, onShowMore } = props

  const { networkId } = context

  const defaultCollateral = getDefaultToken(networkId)
  const defaultArbitrator = getDefaultArbitrator(networkId)

  const marketDataDefault: MarketData = {
    collateral: defaultCollateral,
    collateralsCustom: [],
    arbitratorsCustom: [],
    categoriesCustom: [],
    question: '',
    category: '',
    resolution: null,
    arbitrator: defaultArbitrator,
    spread: MARKET_FEE,
    funding: new BigNumber('0'),
    outcomes: [
      {
        name: 'Yes',
        probability: 50,
      },
      {
        name: 'No',
        probability: 50,
      },
    ],
    loadedQuestionId: null,
  }

  const [marketData] = useState<MarketData>(marketDataDefault)
  const marketStatus = ['Open', 'Closed']
  const collateral = ['DAI', 'ETH']
  const arbitrator = ['Kleros', 'Realitio Team']
  const questionType = ['Binary', 'Scallar']

  const showMoreButton =
    props.moreMarkets && !RemoteData.is.loading(markets) ? (
      <Button disabled={RemoteData.is.reloading(markets)} onClick={onShowMore}>
        {RemoteData.is.reloading(markets) ? 'Loading...' : 'Show more'}
      </Button>
    ) : null

  return (
    <>
      <SectionTitle title={'MARKETS'} />
      <ListCard>
        {marketData.categoriesCustom}
        <StyledFormRow
          formField={<SearchInput value="" name="search" placeholder="Market Name" />}
          title={'Search'}
        />
        <StyledFormRow
          formField={
            <>
              <Categories
                name="category"
                value="Politics"
                customValues={marketData.categoriesCustom}
                label="Category"
              />
              <SelectOptions
                name="status"
                value="Open"
                customValues={marketStatus}
                label="Status"
              />
              <SelectOptions
                name="collateral"
                value="DAI"
                customValues={collateral}
                label="Collateral"
              />
              <SelectOptions
                name="arbitrator"
                value="Kleros"
                customValues={arbitrator}
                label="Arbitrator"
              />
              <SelectOptions
                name="question"
                value="Binary"
                customValues={questionType}
                label="Question Type"
              />
            </>
          }
          title={'Search Filters'}
        />
        <StyledFormRow
          formField={
            <>
              <CheckboxInput name="ownOutcome" label="I own Outcome Tokens" />
              <CheckboxInput name="ownPool" label="I own Pool Tokens" />
              <CheckboxInput name="createdByMe" label="Created by me" />
            </>
          }
          title={'My Participation'}
        />
        <StyledRow>
          <p>
            {RemoteData.hasData(markets) && markets.data.length > 0 && markets.data.length} Markets{' '}
          </p>
          {context.account && (
            <FilterStyled
              defaultOption={currentFilter}
              options={[
                MarketFilter.allMarkets(),
                MarketFilter.fundedMarkets(context.account),
                MarketFilter.predictedOnMarkets(context.account),
                MarketFilter.winningResultMarkets(context.account),
              ]}
              onFilterChange={onFilterChange}
            />
          )}
        </StyledRow>
        {RemoteData.hasData(markets) &&
          markets.data.length > 0 &&
          markets.data.slice(0, count).map(item => {
            return <ListItem key={`${item.address}_${item.conditionId}`} data={item}></ListItem>
          })}
        {RemoteData.is.success(markets) && markets.data.length === 0 && (
          <NoMarketsAvailable title={'No markets available'} />
        )}
        {showMoreButton}
        <LoadingWrapper>{RemoteData.is.loading(markets) ? <LoadingItem /> : null}</LoadingWrapper>
      </ListCard>
    </>
  )
}
