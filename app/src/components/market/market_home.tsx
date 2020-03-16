import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import { ConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { RemoteData } from '../../util/remote_data'
import { Button, ButtonSelectable, ListCard, ListItem, Loading, SectionTitle } from '../common'

const CATEGORIES = ['All', 'Politics', 'Cryptocurrencies', 'Sports', 'Esports', 'NBA']

const TopContents = styled.div`
  padding: 25px;
`

const CategoriesWrapper = styled.div`
  align-items: center;
  border-bottom: 1px solid ${props => props.theme.borders.borderColor};
  display: flex;
  margin-bottom: 20px;
  padding-bottom: 20px;
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
  margin-right: 25px;
`

const NoMarketsAvailable = styled.p`
  align-self: center;
  font-size: 18px;
  margin: 0;
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
      <SectionTitle title={'Markets'} />
      <ListCard>
        {context.account && (
          <TopContents>
            <CategoriesWrapper>
              {CATEGORIES.map((c, index) => (
                <SelectableButton active={c === category} key={index} onClick={() => setCategory(c)}>
                  {c}
                </SelectableButton>
              ))}
            </CategoriesWrapper>
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
        {RemoteData.hasData(markets) &&
          markets.data.length > 0 &&
          markets.data.slice(0, count).map(item => {
            return <ListItem key={item.id} market={item}></ListItem>
          })}
        {RemoteData.is.success(markets) && markets.data.length === 0 && (
          <NoMarketsAvailable title={'No markets available'} />
        )}
        {moreMarkets && showMoreButton}
      </ListCard>
      {RemoteData.is.loading(markets) ? <Loading message="Loading markets..." /> : null}
    </>
  )
}
