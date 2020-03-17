import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import { ConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { RemoteData } from '../../util/remote_data'
import { Button, ButtonSelectable, ListCard, ListItem, Loading, SectionTitle } from '../common'
import { MarketsCategories } from '../common/markets_categories'

const CATEGORIES = ['All', 'Politics', 'Cryptocurrencies', 'Sports', 'Esports', 'NBA']

const SectionTitleMarket = styled(SectionTitle)`
  font-size: 18px;
`

const TopContents = styled.div`
  padding: 25px;
`

const SelectableButton = styled(ButtonSelectable)`
  margin-right: 10px;

  &:last-child {
    margin-right: 0;
  }
`

const FiltersWrapper = styled.div`
  align-items: center;
  display: flex;
`

const FiltersButtons = styled.div`
  align-items: center;
  display: flex;
`

const ListWrapper = styled.div`
  border-top: 1px solid ${props => props.theme.borders.borderColor};
  display: flex;
  flex-direction: column;
  min-height: 200px;
`

const NoMarketsAvailable = styled.p`
  font-size: 18px;
  margin: auto 0;
  text-align: center;
`

interface Props {
  context: ConnectedWeb3Context
  count: number
  currentFilter: any
  markets: RemoteData<any[]>
  moreMarkets: boolean
  onFilterChange: (filter: any) => void
  onShowMore: () => void
}

export const MarketHome: React.FC<Props> = (props: Props) => {
  const { context, count, markets, moreMarkets, onFilterChange, onShowMore } = props
  const [state, setState] = useState('OPEN')
  const [category, setCategory] = useState('All')
  const [sortBy, setSortBy] = useState<Maybe<string>>(null)

  useEffect(() => {
    onFilterChange({ category, sortBy, state })
  }, [category, sortBy, state, onFilterChange])

  const showMoreButton = !RemoteData.is.loading(markets) ? (
    <Button disabled={RemoteData.is.reloading(markets)} onClick={onShowMore}>
      {RemoteData.is.reloading(markets) ? 'Loading...' : 'Show more'}
    </Button>
  ) : null

  return (
    <>
      <SectionTitleMarket title={'Markets'} />
      <ListCard>
        {context.account && (
          <TopContents>
            <MarketsCategories>
              {CATEGORIES.map((item, index) => (
                <SelectableButton active={item === category} key={index} onClick={() => setCategory(item)}>
                  {item}
                </SelectableButton>
              ))}
            </MarketsCategories>
            <FiltersWrapper>
              <FiltersButtons>
                <SelectableButton active={state === 'OPEN'} onClick={() => setState('OPEN')}>
                  Open
                </SelectableButton>
                <SelectableButton active={state === 'CLOSED'} onClick={() => setState('CLOSED')}>
                  Closed
                </SelectableButton>
                <SelectableButton active={state === 'MY_MARKETS'} onClick={() => setState('MY_MARKETS')}>
                  My Markets
                </SelectableButton>
              </FiltersButtons>
              <button
                onClick={() => {
                  sortBy ? setSortBy(null) : setSortBy('collateralVolume')
                }}
              >
                Sort by Volume
              </button>
            </FiltersWrapper>
          </TopContents>
        )}
        <ListWrapper>
          {RemoteData.hasData(markets) &&
            markets.data.length > 0 &&
            markets.data.slice(0, count).map(item => {
              return <ListItem key={item.id} market={item}></ListItem>
            })}
          {RemoteData.is.success(markets) && markets.data.length === 0 && (
            <NoMarketsAvailable title={'No markets available'} />
          )}
        </ListWrapper>
        {moreMarkets && showMoreButton}
      </ListCard>
      {RemoteData.is.loading(markets) ? <Loading message="Loading markets..." /> : null}
    </>
  )
}
