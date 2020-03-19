import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

import { ConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { RemoteData } from '../../util/remote_data'
import { Button, ButtonCircle, ButtonSelectable } from '../button'
import { ButtonType } from '../button/button_styling_types'
import { ListCard, ListItem, SectionTitle } from '../common'
import { Dropdown, DropdownItemProps, DropdownPosition } from '../common/dropdown'
import { IconFilter } from '../common/icons/IconFilter'
import { IconSearch } from '../common/icons/IconSearch'
import { Search } from '../common/search'
import { InlineLoading } from '../loading'

import { AdvancedFilters } from './advanced_filters'
import { MarketsCategories } from './markets_categories'

const SectionTitleMarket = styled(SectionTitle)`
  .titleText {
    font-size: 18px;
  }
`

const TopContents = styled.div`
  padding: 25px;
`

const SelectableButton = styled(ButtonSelectable)`
  margin-right: 15px;

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
  margin-bottom: 20px;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    margin-bottom: 0;
  }
`

const FiltersControls = styled.div`
  align-items: center;
  display: flex;
  margin-left: auto;
  margin-right: auto;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    margin-left: 0;
    margin-right: 0;
  }
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

const SortDropdown = styled(Dropdown)`
  width: 130px;
`

const LoadMoreWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  padding: 20px 15px 25px;
`

interface Props {
  context: ConnectedWeb3Context
  count: number
  currentFilter: any
  markets: RemoteData<any[]>
  moreMarkets: boolean
  onFilterChange: (filter: any) => void
  onLoadMore: () => void
}

enum FiltersStates {
  open = 'OPEN',
  closed = 'CLOSED',
  myMarkets = 'MY_MARKETS',
}

export const MarketHome: React.FC<Props> = (props: Props) => {
  const { context, count, markets, moreMarkets, onFilterChange, onLoadMore } = props
  const [state, setState] = useState<FiltersStates>(FiltersStates.open)
  const [category, setCategory] = useState('All')
  const [sortBy, setSortBy] = useState<Maybe<string>>(null)
  const [showSearch, setShowSearch] = useState<boolean>(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false)
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

  const toggleSearch = useCallback(() => {
    setShowAdvancedFilters(false)
    setShowSearch(!showSearch)
  }, [showSearch])

  const toggleFilters = useCallback(() => {
    setShowSearch(false)
    setShowAdvancedFilters(!showAdvancedFilters)
  }, [showAdvancedFilters])

  const sortOptions: Array<DropdownItemProps> = [
    {
      content: 'Volume',
      onClick: () => {
        setSortBy('collateralVolume')
      },
    },
    {
      content: 'Option 1',
      onClick: () => {
        setSortBy(null)
        console.warn('Sort by option 1')
      },
    },
    {
      content: 'Option 2',
      onClick: () => {
        setSortBy(null)
        console.warn('Sort by option 2')
      },
    },
  ]

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
                <ButtonCircleStyled active={showAdvancedFilters} onClick={toggleFilters}>
                  <IconFilter />
                </ButtonCircleStyled>
                <SortDropdown dropdownPosition={DropdownPosition.right} items={sortOptions} placeholder={'Sort By'} />
              </FiltersControls>
            </FiltersWrapper>
          </TopContents>
        )}
        {showSearch && <Search />}
        {showAdvancedFilters && <AdvancedFilters />}
        <ListWrapper>
          {RemoteData.hasData(markets) &&
            markets.data.length > 0 &&
            markets.data.slice(0, count).map(item => {
              return <ListItem key={item.id} market={item}></ListItem>
            })}
          {RemoteData.is.success(markets) && markets.data.length === 0 && (
            <NoMarketsAvailable title={'No markets available'} />
          )}
          {RemoteData.is.loading(markets) && <InlineLoading message="Loading Markets..." />}
        </ListWrapper>
        {moreMarkets && !RemoteData.is.loading(markets) && (
          <LoadMoreWrapper>
            <Button
              buttonType={ButtonType.secondaryLine}
              disabled={RemoteData.is.reloading(markets)}
              onClick={onLoadMore}
            >
              {RemoteData.is.reloading(markets) ? 'Loading...' : 'Load more'}
            </Button>
          </LoadMoreWrapper>
        )}
      </ListCard>
    </>
  )
}
