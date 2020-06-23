import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

import {
  CATEGORIES,
} from '../../../../common/constants'
import { ConnectedWeb3Context } from '../../../../hooks/connectedWeb3'
import { MarketMakerDataItem } from '../../../../queries/markets_home'
import { RemoteData } from '../../../../util/remote_data'
import { MarketFilters, MarketStates, MarketsSortCriteria } from '../../../../util/types'
import { Button, ButtonCircle, ButtonSelectable } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import { SectionTitle } from '../../../common'
import { Dropdown, DropdownItemProps, DropdownPosition } from '../../../common/form/dropdown'
import { IconFilter } from '../../../common/icons/IconFilter'
import { IconSearch } from '../../../common/icons/IconSearch'
import { InlineLoading } from '../../../loading'
import { AdvancedFilters } from '../../common/advanced_filters'
import { ListCard } from '../../common/list_card'
import { ListItem } from '../../common/list_item'
import { MarketsCategories } from '../../common/markets_categories'
import { Search } from '../../common/search'

const SectionTitleMarket = styled(SectionTitle)`
  .titleText {
    font-size: 18px;
  }
`

const TopContents = styled.div`
  padding: 25px;
`

const SelectableButton = styled(ButtonSelectable)`
  margin-right: 5px;

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
    padding-left: 10px;
  }
`

const ButtonCircleStyled = styled(ButtonCircle)`
  margin-right: 5px;
`

const ListWrapper = styled.div`
  border-top: 1px solid ${props => props.theme.borders.borderColor};
  display: flex;
  flex-direction: column;
  min-height: 355px;
`

const NoMarketsAvailable = styled.p`
  color: ${props => props.theme.colors.textColor};
  font-size: 14px;
  margin: auto 0;
  text-align: center;
`

const NoOwnMarkets = styled.p`
  color: ${props => props.theme.colors.textColor};
  font-size: 14px;
  margin: auto 0;
  text-align: center;
`

const SortDropdown = styled(Dropdown)`
  max-width: 145px;
`

const LoadMoreWrapper = styled.div`
  align-items: center;
  border-top: 1px solid ${props => props.theme.borders.borderColor};
  display: flex;
  justify-content: center;
  padding: 0 15px 25px;
`

const ButtonLoadMoreWrapper = styled(Button)`
  margin-top: 20px;
`

const CustomDropdownItem = styled.div`
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;

  .dropdownItems & .sortBy {
    display: none;
  }
`

const SortBy = styled.span`
  color: ${props => props.theme.colors.textColorLighter};
  font-size: 14px;
  line-height: 1.2;
  margin-right: 6px;
`

interface Props {
  context: ConnectedWeb3Context
  count: number
  currentFilter: any
  isFiltering?: boolean
  markets: RemoteData<MarketMakerDataItem[]>
  moreMarkets: boolean
  onFilterChange: (filter: MarketFilters) => void
  onLoadMore: () => void
}

export const MarketHome: React.FC<Props> = (props: Props) => {
  const { count, isFiltering = false, markets, moreMarkets, onFilterChange, onLoadMore } = props
  const [state, setState] = useState<MarketStates>(MarketStates.open)
  const [category, setCategory] = useState('All')
  const [title, setTitle] = useState('')
  const [sortBy, setSortBy] = useState<Maybe<MarketsSortCriteria>>(props.currentFilter.sortBy)
  const [sortByDirection, setSortByDirection] = useState<'asc' | 'desc'>(props.currentFilter.sortByDirection)
  const [showSearch, setShowSearch] = useState<boolean>(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false)
  const [arbitrator, setArbitrator] = useState<Maybe<string>>(null)
  const [currency, setCurrency] = useState<Maybe<string>>(props.currentFilter.currency)
  const [templateId, setTemplateId] = useState<Maybe<string>>(null)
  const CATEGORIES_WITH_ALL = ['All', ...CATEGORIES]
  const filters = [
    {
      state: MarketStates.open,
      title: 'Open',
      active: state === MarketStates.open,
      onClick: () => setState(MarketStates.open),
    },
    {
      state: MarketStates.pending,
      title: 'Pending',
      active: state === MarketStates.pending,
      onClick: () => setState(MarketStates.pending),
    },
    {
      state: MarketStates.closed,
      title: 'Closed',
      active: state === MarketStates.closed,
      onClick: () => setState(MarketStates.closed),
    },
    {
      state: MarketStates.myMarkets,
      title: 'My Markets',
      active: state === MarketStates.myMarkets,
      onClick: () => setState(MarketStates.myMarkets),
    },
  ]

  useEffect(() => {
    onFilterChange({ arbitrator, templateId, currency, category, sortBy, sortByDirection, state, title })
  }, [arbitrator, templateId, currency, category, sortBy, sortByDirection, state, title, onFilterChange])

  const toggleSearch = useCallback(() => {
    setShowAdvancedFilters(false)
    setShowSearch(!showSearch)
  }, [showSearch])

  const toggleFilters = useCallback(() => {
    setShowSearch(false)
    setShowAdvancedFilters(!showAdvancedFilters)
  }, [showAdvancedFilters])

  const sortOptions = [
    {
      title: '24h volume',
      sortBy: 'lastActiveDayAndRunningDailyVolume',
      direction: 'desc',
    },
    {
      title: 'Total volume',
      sortBy: 'collateralVolume',
      direction: 'desc',
    },
    {
      title: 'Highest liquidity',
      sortBy: 'liquidityParameter',
      direction: 'desc',
    },
    {
      title: 'Newest',
      sortBy: 'creationTimestamp',
      direction: 'desc',
    },
    {
      title: 'Ending soon',
      sortBy: 'openingTimestamp',
      direction: 'asc',
    },
  ] as const

  const sortItems: Array<DropdownItemProps> = sortOptions.map(item => {
    return {
      content: (
        <CustomDropdownItem>
          <SortBy className="sortBy">Sort By</SortBy> {item.title}
        </CustomDropdownItem>
      ),
      onClick: () => {
        setSortBy(item.sortBy)
        setSortByDirection(item.direction)
      },
    }
  })

  const noOwnMarkets = RemoteData.is.success(markets) && markets.data.length === 0 && state === MarketStates.myMarkets
  const noMarketsAvailable =
    RemoteData.is.success(markets) && markets.data.length === 0 && state !== MarketStates.myMarkets
  const showFilteringInlineLoading = !noMarketsAvailable && !noOwnMarkets && isFiltering
  const disableLoadMoreButton =
    isFiltering || !moreMarkets || RemoteData.is.loading(markets) || RemoteData.is.reloading(markets)

  return (
    <>
      <SectionTitleMarket title={'Markets'} />
      <ListCard>
        <TopContents>
          <MarketsCategories>
            {CATEGORIES_WITH_ALL.map((item, index) => (
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
              <SortDropdown
                dropdownPosition={DropdownPosition.right}
                items={sortItems}
                placeholder={<SortBy>Sort By</SortBy>}
              />
            </FiltersControls>
          </FiltersWrapper>
        </TopContents>
        {showSearch && <Search onChange={setTitle} value={title} />}
        {showAdvancedFilters && (
          <AdvancedFilters
            currency={currency}
            onChangeArbitrator={setArbitrator}
            onChangeCurrency={setCurrency}
            onChangeTemplateId={setTemplateId}
          />
        )}
        <ListWrapper>
          {!isFiltering &&
            RemoteData.hasData(markets) &&
            markets.data.length > 0 &&
            markets.data.slice(0, count).map(item => {
              return <ListItem key={item.address} market={item}></ListItem>
            })}
          {noOwnMarkets && <NoOwnMarkets>You haven&apos;t participated in or created any market yet.</NoOwnMarkets>}
          {noMarketsAvailable && <NoMarketsAvailable>No markets available.</NoMarketsAvailable>}
          {showFilteringInlineLoading && <InlineLoading message="Loading Markets..." />}
        </ListWrapper>
        {RemoteData.hasData(markets) && markets.data.length === 0 ? null : (
          <LoadMoreWrapper>
            <ButtonLoadMoreWrapper
              buttonType={ButtonType.secondaryLine}
              disabled={disableLoadMoreButton}
              onClick={onLoadMore}
            >
              {RemoteData.is.reloading(markets) ? 'Loading...' : 'Load more'}
            </ButtonLoadMoreWrapper>
          </LoadMoreWrapper>
        )}
      </ListCard>
    </>
  )
}
