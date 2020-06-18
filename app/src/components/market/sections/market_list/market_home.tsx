import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

import { ConnectedWeb3Context } from '../../../../hooks/connectedWeb3'
import { CategoryDataItem, MarketMakerDataItem } from '../../../../queries/markets_home'
import { RemoteData } from '../../../../util/remote_data'
import { MarketFilters, MarketStates, MarketsSortCriteria } from '../../../../util/types'
import { Button, ButtonCircle } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import { SectionTitle } from '../../../common'
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

const SectionTitleMarket = styled(SectionTitle)`
  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    margin-bottom: 0;
  }

  .titleText {
    font-size: 18px;
    @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
      text-align: left;
      padding-left: 0;
    }
  }
  margin-bottom: 0;
`

const TopContents = styled.div`
  padding: 25px;
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

const PageSizeDropdown = styled(Dropdown)`
  max-width: 145px;
`

const LoadMoreWrapper = styled.div`
  align-items: center;
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

const SecondaryText = styled.span`
  color: ${props => props.theme.colors.textColorLighter};
  font-size: 14px;
  line-height: 1.2;
  margin-right: 6px;
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
  border-top: 1px solid ${props => props.theme.borders.borderColor};
`

const DisplayButtonWrapper = styled.div`
  padding: 0 15px;
`

interface Props {
  context: ConnectedWeb3Context
  count: number
  currentFilter: any
  isFiltering?: boolean
  markets: RemoteData<MarketMakerDataItem[]>
  categories: RemoteData<CategoryDataItem[]>
  moreMarkets: boolean
  pageIndex: number
  onFilterChange: (filter: MarketFilters) => void
  onUpdatePageSize: (size: number) => void
  onLoadNextPage: () => void
  onLoadPrevPage: () => void
}

export const MarketHome: React.FC<Props> = (props: Props) => {
  const { 
    categories,
    count,
    isFiltering = false,
    markets,
    moreMarkets,
    onFilterChange,
    onLoadNextPage,
    onLoadPrevPage,
    onUpdatePageSize,
    pageIndex,
  } = props
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

  const filters = [
    {
      state: MarketStates.open,
      title: 'Open',
      active: state === MarketStates.open,
      onClick: () => setState(MarketStates.open),
    },
    {
      state: MarketStates.pending,
      title: 'Finalizing',
      active: state === MarketStates.pending,
      onClick: () => setState(MarketStates.pending),
    },
    {
      state: MarketStates.closed,
      title: 'Ended',
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
          <SecondaryText className="sortBy">Sort By</SecondaryText> {item.title}
        </CustomDropdownItem>
      ),
      onClick: () => {
        setSortBy(item.sortBy)
        setSortByDirection(item.direction)
      },
    }
  })

  const filterItems: Array<DropdownItemProps> = filters.map(item => {
    return {
      content: <CustomDropdownItem>{item.title}</CustomDropdownItem>,
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
          ...categories.data.map((item: CategoryDataItem, index) => {
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
  const showFilteringInlineLoading = !noMarketsAvailable && !noOwnMarkets && isFiltering
  const disableLoadNextButton =
    isFiltering || !moreMarkets || RemoteData.is.loading(markets) || RemoteData.is.reloading(markets)
  const disableLoadPrevButton =
    isFiltering || pageIndex === 0 || RemoteData.is.loading(markets) || RemoteData.is.reloading(markets)

  return (
    <>
      <Actions>
        <MarketsDropdown
          dropdownDirection={DropdownDirection.downwards}
          dropdownVariant={DropdownVariant.card}
          items={categoryItems}
          showScrollbar={true}
        />
        <MarketsFilterDropdown
          dropdownDirection={DropdownDirection.downwards}
          dropdownVariant={DropdownVariant.card}
          items={filterItems}
        />
      </Actions>
      <ListCard>
        <TopContents>
          <FiltersWrapper>
            <SectionTitleMarket title={'Markets'} />
            <FiltersControls>
              <ButtonCircleStyled active={showSearch} onClick={toggleSearch}>
                <IconSearch />
              </ButtonCircleStyled>
              {showAdvancedFilters && (
                <ButtonCircleStyled active={showAdvancedFilters} onClick={toggleFilters}>
                  <IconFilter />
                </ButtonCircleStyled>
              )}
              <SortDropdown
                dropdownPosition={DropdownPosition.right}
                items={sortItems}
                placeholder={<SecondaryText>Sort By</SecondaryText>}
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
        <BottomContents>
          <DisplayButtonWrapper>
            <PageSizeDropdown
              dropdownPosition={DropdownPosition.right}
              items={sizeItems}
              placeholder={<Display>Display</Display>}
            />
          </DisplayButtonWrapper>
          {RemoteData.hasData(markets) && markets.data.length === 0 ? null : (
            <LoadMoreWrapper>
              <ButtonLoadMoreWrapper
                buttonType={ButtonType.secondaryLine}
                disabled={disableLoadPrevButton}
                onClick={onLoadPrevPage}
              >
                {RemoteData.is.reloading(markets) ? 'Loading...' : 'Load prev'}
              </ButtonLoadMoreWrapper>
              <ButtonLoadMoreWrapper
                buttonType={ButtonType.secondaryLine}
                disabled={disableLoadNextButton}
                onClick={onLoadNextPage}
              >
                {RemoteData.is.reloading(markets) ? 'Loading...' : 'Load next'}
              </ButtonLoadMoreWrapper>
            </LoadMoreWrapper>
          )}
        </BottomContents>
      </ListCard>
    </>
  )
}
