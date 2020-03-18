import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

import { ConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { RemoteData } from '../../util/remote_data'
import { Button, ButtonCircle, ButtonSelectable, ListCard, ListItem, Loading, SectionTitle, Textfield } from '../common'
import { IconFilter } from '../common/icons/IconFilter'
import { IconSearch } from '../common/icons/IconSearch'
import { MarketsCategories } from '../common/markets_categories'

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
  justify-content: space-between;
  flex-direction: column;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    flex-direction: row;
  }
`

const FiltersCategories = styled.div`
  align-items: center;
  display: flex;
`

const FiltersControls = styled.div`
  align-items: center;
  display: flex;
`

const ButtonCircleStyled = styled(ButtonCircle)`
  margin-right: 10px;
`

const ListWrapper = styled.div`
  border-top: 1px solid ${props => props.theme.borders.borderColor};
  display: flex;
  flex-direction: column;
  min-height: 380px;
`

const NoMarketsAvailable = styled.p`
  color: ${props => props.theme.colors.textColor};
  font-size: 14px;
  margin: auto 0;
  text-align: center;
`

const SearchWrapper = styled.div`
  padding: 0 25px 25px 25px;
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

enum FiltersStates {
  open = 'OPEN',
  closed = 'CLOSED',
  myMarkets = 'MY_MARKETS',
}

export const MarketHome: React.FC<Props> = (props: Props) => {
  const { context, count, markets, moreMarkets, onFilterChange, onShowMore } = props
  const [state, setState] = useState<FiltersStates>(FiltersStates.open)
  const [category, setCategory] = useState('All')
  const [sortBy, setSortBy] = useState<Maybe<string>>(null)
  const [showSearch, setShowSearch] = useState<boolean>(false)
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const CATEGORIES = ['All', 'Politics', 'Cryptocurrencies', 'Sports', 'Esports', 'NBA']
  const filters = [
    {
      title: 'Open',
      active: state === FiltersStates.open,
      onClick: () => setState(FiltersStates.open),
    },
    {
      title: 'Closed',
      active: state === FiltersStates.closed,
      onClick: () => setState(FiltersStates.closed),
    },
    {
      title: 'My Markets',
      active: state === FiltersStates.myMarkets,
      onClick: () => setState(FiltersStates.myMarkets),
    },
  ]

  useEffect(() => {
    onFilterChange({ category, sortBy, state })
  }, [category, sortBy, state, onFilterChange])

  const showMoreButton = !RemoteData.is.loading(markets) ? (
    <Button disabled={RemoteData.is.reloading(markets)} onClick={onShowMore}>
      {RemoteData.is.reloading(markets) ? 'Loading...' : 'Show more'}
    </Button>
  ) : null

  const toggleSearch = useCallback(() => {
    setShowSearch(!showSearch)
  }, [showSearch])

  const toggleFilters = useCallback(() => {
    setShowFilters(!showFilters)
  }, [showFilters])

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
              <FiltersCategories>
                {filters.map((item, index) => {
                  return (
                    <SelectableButton active={item.active} key={index} onClick={item.onClick}>
                      {item.title}
                    </SelectableButton>
                  )
                })}
              </FiltersCategories>
              <FiltersControls>
                <ButtonCircleStyled active={showSearch} onClick={toggleSearch}>
                  <IconSearch />
                </ButtonCircleStyled>
                <ButtonCircleStyled active={showFilters} onClick={toggleFilters}>
                  <IconFilter />
                </ButtonCircleStyled>
                <button
                  onClick={() => {
                    sortBy ? setSortBy(null) : setSortBy('collateralVolume')
                  }}
                >
                  Sort by Volume
                </button>
              </FiltersControls>
            </FiltersWrapper>
          </TopContents>
        )}
        {showSearch && (
          <SearchWrapper>
            <Textfield placeholder="Search Market" />
          </SearchWrapper>
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
