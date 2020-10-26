import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled, { css } from 'styled-components'

import { ConnectedWeb3Context } from '../../../../hooks/connectedWeb3'
import { getLogger } from '../../../../util/logger'
import { RemoteData } from '../../../../util/remote_data'
import {
  CategoryDataItem,
  CurationSource,
  MarketFilters,
  MarketMakerDataItem,
  MarketStates,
  MarketsSortCriteria,
} from '../../../../util/types'
import { ButtonCircle } from '../../../button'
import {
  Dropdown,
  DropdownDirection,
  DropdownItemProps,
  DropdownPosition,
  DropdownVariant,
} from '../../../common/form/dropdown'
import { IconFilter } from '../../../common/icons/IconFilter'
import { IconSearch } from '../../../common/icons/IconSearch'
import { InlineLoading } from '../../../loading'
import { AdvancedFilters } from '../../common/advanced_filters'
import { ListCard } from '../../common/list_card'
import { ListItem } from '../../common/list_item'
import { Search } from '../../common/search'

const TopContents = styled.div`
  padding: 25px 25px 20px 25px;
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

const FiltersControls = styled.div<{ disabled?: boolean }>`
  align-items: center;
  display: flex;
  margin-left: auto;
  margin-right: auto;
  pointer-events: ${props => (props.disabled ? 'none' : 'initial')};

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    margin-left: 0;
    margin-right: 0;
    padding-left: 10px;
  }
`

const ButtonRoundActiveCSS = css`
  &,
  &:hover {
    background-color: #fff;
    border-color: ${props => props.theme.colors.borderColorDar};
  }
`

const ButtonRoundStyled = styled(ButtonCircle)<{
  disabled?: boolean
}>`
  border-radius: 8px;
  height: 40px;
  width: auto;
  color: ${({ theme }) => theme.colors.textColorDark};
  svg {
    filter: ${props =>
      props.disabled
        ? 'invert(46%) sepia(0%) saturate(1168%) hue-rotate(183deg) brightness(99%) contrast(89%)'
        : 'none'};
  }
  ${props => props.active && ButtonRoundActiveCSS}
`

const ButtonSearchStyled = styled(ButtonRoundStyled as any)`
  width: 40px;
`

const ButtonFilterStyled = styled(ButtonRoundStyled as any)`
  padding: 12px 17px;
  span {
    font-size: 14px;
    line-height: 16px;
  }
  & > * + * {
    margin-left: 10px;
  }
`

const ButtonPaginationStyled = styled(ButtonRoundStyled as any)`
  padding: 12px 20px;
  font-size: 14px;
  line-height: 16px;
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

const LoadMoreWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  padding: 0 25px 0 15px;

  & > * + * {
    margin-left: 12px;
  }
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

const SortDropdown = styled(Dropdown)`
  min-width: 170px;
`

const MarketsDropdown = styled(Dropdown)`
  width: 100%;
`

const MarketsFilterDropdown = styled(Dropdown)`
  width: 100%;
`

const Actions = styled.div`
  margin: 0 auto 25px;
  max-width: 100%;
  width: ${props => props.theme.mainContainer.maxWidth};
  > div:first-child {
    margin-bottom: 14px;
  }
  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    display: flex;
    justify-content: space-evenly;
    > div:first-child {
      margin-right: 14px;
      margin-bottom: 0;
    }
  }
`

const Display = styled.span`
  color: ${props => props.theme.colors.textColorLighter};
  font-size: 14px;
  line-height: 1.2;
  margin-right: 6px;
`

const BottomContents = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0px 25px 0px;
  border-top: 1px solid ${props => props.theme.borders.borderColor};
`

const DisplayButtonWrapper = styled.div`
  padding: 0 15px 0 25px;
`

const DisplayDropdown = styled(Dropdown)`
  .dropdownItems {
    min-width: auto;
  }
`

const FiltersLeftWrapper = styled.div`
  display: flex;
  align-items: center;
  & > * + * {
    margin-left: 10px;
  }
`

interface Props {
  context: ConnectedWeb3Context
  count: number
  currentFilter: any
  isFiltering?: boolean
  fetchMyMarkets: boolean
  markets: RemoteData<MarketMakerDataItem[]>
  categories: RemoteData<CategoryDataItem[]>
  moreMarkets: boolean
  pageIndex: number
  onFilterChange: (filter: MarketFilters) => void
  onUpdatePageSize: (size: number) => void
  onLoadNextPage: () => void
  onLoadPrevPage: () => void
}

const logger = getLogger('MarketHome')

export const MarketHome: React.FC<Props> = (props: Props) => {
  const {
    categories,
    context,
    count,
    currentFilter,
    fetchMyMarkets,
    isFiltering = false,
    markets,
    moreMarkets,
    onFilterChange,
    onLoadNextPage,
    onLoadPrevPage,
    onUpdatePageSize,
    pageIndex,
  } = props
  const [counts, setCounts] = useState({
    open: 0,
    closed: 0,
    total: 0,
  })
  const [state, setState] = useState<MarketStates>(currentFilter.state)
  const [category, setCategory] = useState(currentFilter.category)
  const [title, setTitle] = useState(currentFilter.title)
  const [sortBy, setSortBy] = useState<Maybe<MarketsSortCriteria>>(currentFilter.sortBy)
  const [sortByDirection, setSortByDirection] = useState<'asc' | 'desc'>(currentFilter.sortByDirection)
  const [showSearch, setShowSearch] = useState<boolean>(currentFilter.title.length > 0 ? true : false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(
    currentFilter.currency || currentFilter.arbitrator || currentFilter.curationSource !== CurationSource.ALL_SOURCES,
  )
  const [arbitrator, setArbitrator] = useState<Maybe<string>>(currentFilter.arbitrator)
  const [currency, setCurrency] = useState<Maybe<string> | null>(currentFilter.currency)
  const [templateId, setTemplateId] = useState<Maybe<string>>(null)
  const [curationSource, setCurationSource] = useState<CurationSource>(currentFilter.curationSource)

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
      state: MarketStates.finalizing,
      title: 'Finalizing',
      active: state === MarketStates.finalizing,
      onClick: () => setState(MarketStates.finalizing),
    },
    {
      state: MarketStates.arbitrating,
      title: 'Arbitrating',
      active: state === MarketStates.arbitrating,
      onClick: () => setState(MarketStates.arbitrating),
    },
    {
      state: MarketStates.closed,
      title: 'Closed',
      active: state === MarketStates.closed,
      onClick: () => setState(MarketStates.closed),
    },
  ]

  // Only allow to filter myMarkets when the user is connected
  if (context.account) {
    filters.push({
      state: MarketStates.myMarkets,
      title: 'My Markets',
      active: state === MarketStates.myMarkets,
      onClick: () => {
        setState(MarketStates.myMarkets)
        setSortBy('openingTimestamp')
        setSortByDirection('asc')
      },
    })
  }

  useEffect(() => {
    if (state === MarketStates.myMarkets && !context.account) {
      logger.log(`User disconnected, update filter`)
      setState(MarketStates.open)
    }
  }, [context.account, state])

  useEffect(() => {
    if (RemoteData.hasData(categories)) {
      const index = categories.data.findIndex(i => i.id === decodeURI(category))
      const item = categories.data[index]
      !!item && setCounts({ open: item.numOpenConditions, closed: item.numClosedConditions, total: item.numConditions })
      if (category === 'All') setCounts({ open: 0, closed: 0, total: 0 })
    }
  }, [category, categories])

  useEffect(() => {
    onFilterChange({
      arbitrator,
      curationSource,
      templateId,
      currency,
      category,
      sortBy,
      sortByDirection,
      state,
      title,
    })
  }, [
    arbitrator,
    curationSource,
    templateId,
    currency,
    category,
    sortBy,
    sortByDirection,
    state,
    title,
    onFilterChange,
  ])

  const isInitialMount = useRef(true)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = true
    } else {
      setShowAdvancedFilters(
        currentFilter.currency ||
          currentFilter.arbitrator ||
          currentFilter.curationSource !== CurationSource.ALL_SOURCES,
      )
    }
  }, [currentFilter, fetchMyMarkets])

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
      sortBy: `sort24HourVolume${Math.floor(Date.now() / (1000 * 60 * 60)) % 24}` as MarketsSortCriteria,
      direction: 'desc',
    },
    {
      title: 'Total volume',
      sortBy: 'usdVolume',
      direction: 'desc',
    },
    {
      title: 'Highest liquidity',
      sortBy: 'usdLiquidityParameter',
      direction: 'desc',
    },
    {
      title: 'Newest',
      sortBy: 'creationTimestamp',
      direction: 'desc',
    },
    {
      title: 'Closing soon',
      sortBy: 'openingTimestamp',
      direction: 'asc',
    },
  ] as const

  const myMarketsSortOptions = [
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
      content: <CustomDropdownItem>{item.title}</CustomDropdownItem>,
      onClick: () => {
        setSortBy(item.sortBy)
        setSortByDirection(item.direction)
      },
    }
  })

  const myMarketsSortItems: Array<DropdownItemProps> = myMarketsSortOptions.map(item => {
    return {
      content: <CustomDropdownItem>{item.title}</CustomDropdownItem>,
      onClick: () => {
        setSortBy(item.sortBy)
        setSortByDirection(item.direction)
      },
    }
  })

  const filterItems: Array<DropdownItemProps> = filters.map((item, index) => {
    const count = index === 0 ? counts.open : index === 3 ? counts.closed : 0
    return {
      content: <CustomDropdownItem>{item.title}</CustomDropdownItem>,
      secondaryText: count > 0 && count.toString(),
      onClick: item.onClick,
    }
  })

  const categoryItems: Array<DropdownItemProps> =
    RemoteData.hasData(categories) && categories.data.length > 0
      ? ([
          {
            content: <CustomDropdownItem>{'All Categories'}</CustomDropdownItem>,
            onClick: () => {
              setCategory('All')
            },
          },
          ...categories.data.map((item: CategoryDataItem) => {
            return {
              content: <CustomDropdownItem>{item.id}</CustomDropdownItem>,
              onClick: () => {
                setCategory(item.id)
              },
            }
          }),
        ] as Array<DropdownItemProps>)
      : [
          {
            content: <CustomDropdownItem>{'All Categories'}</CustomDropdownItem>,
          },
        ]

  const sizeOptions = [4, 8, 12]

  const sizeItems: Array<DropdownItemProps> = sizeOptions.map(item => {
    return {
      content: (
        <CustomDropdownItem>
          <Display className="display">Display</Display> {item}
        </CustomDropdownItem>
      ),
      onClick: () => {
        onUpdatePageSize(item)
      },
    }
  })

  const noOwnMarkets = RemoteData.is.success(markets) && markets.data.length === 0 && state === MarketStates.myMarkets
  const noMarketsAvailable =
    RemoteData.is.success(markets) && markets.data.length === 0 && state !== MarketStates.myMarkets
  const showFilteringInlineLoading =
    (!noMarketsAvailable && !noOwnMarkets && isFiltering) || RemoteData.is.loading(markets)
  const disableLoadNextButton = !moreMarkets || RemoteData.is.loading(markets) || RemoteData.is.reloading(markets)
  const disableLoadPrevButton = pageIndex === 0 || RemoteData.is.loading(markets) || RemoteData.is.reloading(markets)

  return (
    <>
      <Actions>
        <MarketsDropdown
          currentItem={
            RemoteData.hasData(categories) ? categories.data.findIndex(i => i.id === decodeURI(category)) + 1 : 0
          }
          dirty={true}
          dropdownDirection={DropdownDirection.downwards}
          dropdownVariant={DropdownVariant.card}
          items={categoryItems}
        />
        <MarketsFilterDropdown
          currentItem={filters.findIndex(i => i.state === state)}
          dirty={true}
          dropdownDirection={DropdownDirection.downwards}
          dropdownVariant={DropdownVariant.card}
          items={filterItems}
        />
      </Actions>
      <ListCard>
        <TopContents>
          <FiltersWrapper>
            <FiltersLeftWrapper>
              <ButtonFilterStyled active={showAdvancedFilters} onClick={toggleFilters}>
                <IconFilter />
                <span>Filters</span>
              </ButtonFilterStyled>
              <ButtonSearchStyled active={showSearch} onClick={toggleSearch}>
                <IconSearch />
              </ButtonSearchStyled>
            </FiltersLeftWrapper>
            <FiltersControls>
              <SortDropdown
                currentItem={
                  fetchMyMarkets
                    ? myMarketsSortOptions.findIndex(i => i.sortBy === sortBy)
                    : sortOptions.findIndex(i => i.sortBy === sortBy)
                }
                dirty={true}
                dropdownPosition={DropdownPosition.center}
                items={fetchMyMarkets ? myMarketsSortItems : sortItems}
              />
            </FiltersControls>
          </FiltersWrapper>
        </TopContents>
        {showSearch && <Search onChange={setTitle} value={title} />}
        {showAdvancedFilters && (
          <AdvancedFilters
            arbitrator={arbitrator}
            curationSource={curationSource}
            currency={currency}
            disableCurationFilter={fetchMyMarkets ? true : false}
            onChangeArbitrator={setArbitrator}
            onChangeCurationSource={setCurationSource}
            onChangeCurrency={setCurrency}
            onChangeTemplateId={setTemplateId}
          />
        )}
        <ListWrapper>
          {!isFiltering &&
            RemoteData.hasData(markets) &&
            markets.data.length > 0 &&
            markets.data.slice(0, count).map(item => {
              return <ListItem currentFilter={currentFilter} key={item.address} market={item}></ListItem>
            })}
          {noOwnMarkets && <NoOwnMarkets>You have not created any market yet.</NoOwnMarkets>}
          {noMarketsAvailable && <NoMarketsAvailable>No markets available.</NoMarketsAvailable>}
          {showFilteringInlineLoading && <InlineLoading message="Loading Markets..." />}
        </ListWrapper>
        <BottomContents>
          <DisplayButtonWrapper>
            <DisplayDropdown
              currentItem={0}
              dirty={true}
              dropdownPosition={DropdownPosition.center}
              items={sizeItems}
              placeholder={<Display>Display</Display>}
            />
          </DisplayButtonWrapper>
          {RemoteData.hasData(markets) && markets.data.length === 0 ? null : (
            <LoadMoreWrapper>
              <ButtonPaginationStyled disabled={disableLoadPrevButton} onClick={onLoadPrevPage}>
                Prev
              </ButtonPaginationStyled>
              <ButtonPaginationStyled disabled={disableLoadNextButton} onClick={onLoadNextPage}>
                Next
              </ButtonPaginationStyled>
            </LoadMoreWrapper>
          )}
        </BottomContents>
      </ListCard>
    </>
  )
}
