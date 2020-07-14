import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

import { ConnectedWeb3Context } from '../../../../hooks/connectedWeb3'
import { CategoryDataItem, MarketMakerDataItem } from '../../../../queries/markets_home'
import { getLogger } from '../../../../util/logger'
import { RemoteData } from '../../../../util/remote_data'
import { MarketFilters, MarketStates, MarketsSortCriteria } from '../../../../util/types'
import { ButtonCircle } from '../../../button'
import { SectionTitle } from '../../../common'
import {
  Dropdown,
  DropdownDirection,
  DropdownItemProps,
  DropdownPosition,
  DropdownVariant,
} from '../../../common/form/dropdown'
import { IconChevronLeft } from '../../../common/icons/IconChevronLeft'
import { IconChevronLeftDisabled } from '../../../common/icons/IconChevronLeftDisabled'
import { IconChevronRight } from '../../../common/icons/IconChevronRight'
import { IconChevronRightDisabled } from '../../../common/icons/IconChevronRightDisabled'
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
`

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

const LoadMoreWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  padding: 0 25px 0 15px;
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
  padding: 20px 0px 25px 0px;
  border-top: 1px solid ${props => props.theme.borders.borderColor};
`

const DisplayButtonWrapper = styled.div`
  padding: 0 15px 0 25px;
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

const logger = getLogger('MarketHome')

export const MarketHome: React.FC<Props> = (props: Props) => {
  const {
    categories,
    context,
    count,
    currentFilter,
    isFiltering = false,
    markets,
    moreMarkets,
    onFilterChange,
    onLoadNextPage,
    onLoadPrevPage,
    onUpdatePageSize,
    pageIndex,
  } = props
  const [state, setState] = useState<MarketStates>(currentFilter.state)
  const [category, setCategory] = useState(currentFilter.category)
  const [title, setTitle] = useState(currentFilter.title)
  const [sortBy, setSortBy] = useState<Maybe<MarketsSortCriteria>>(currentFilter.sortBy)
  const [sortByDirection, setSortByDirection] = useState<'asc' | 'desc'>(currentFilter.sortByDirection)
  const [showSearch, setShowSearch] = useState<boolean>(currentFilter.title.length > 0 ? true : false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(currentFilter.currency || currentFilter.arbitrator ? true : false)
  const [arbitrator, setArbitrator] = useState<Maybe<string>>(currentFilter.arbitrator)
  const [currency, setCurrency] = useState<Maybe<string>>(currentFilter.currency)
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
      state: MarketStates.closed,
      title: 'Ended',
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
      onClick: () => setState(MarketStates.myMarkets),
    })
  }

  useEffect(() => {
    if (state === MarketStates.myMarkets && !context.account) {
      logger.log(`User disconnected, update filter`)
      setState(MarketStates.open)
    }
  }, [context.account, state])

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
      sortBy: 'lastActiveDayAndScaledRunningDailyVolume',
      direction: 'desc',
    },
    {
      title: 'Total volume',
      sortBy: 'scaledCollateralVolume',
      direction: 'desc',
    },
    {
      title: 'Highest liquidity',
      sortBy: 'scaledLiquidityParameter',
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
          currentItem={RemoteData.hasData(categories) ? categories.data.findIndex(i => i.id === decodeURI(category)) + 1 : 0}
          dirty={true}
        />
        <MarketsFilterDropdown
          dropdownDirection={DropdownDirection.downwards}
          dropdownVariant={DropdownVariant.card}
          items={filterItems}
          currentItem={filters.findIndex(i => i.state === state)}
          dirty={true}
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
              <ButtonCircleStyled active={showAdvancedFilters} onClick={toggleFilters}>
                <IconFilter />
              </ButtonCircleStyled>
              <Dropdown
                currentItem={sortOptions.findIndex(i => i.sortBy === sortBy)}
                dirty={true}
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
            arbitrator={arbitrator}
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
              return <ListItem currentFilter={currentFilter} key={item.address} market={item}></ListItem>
            })}
          {noOwnMarkets && <NoOwnMarkets>You have not created any market yet.</NoOwnMarkets>}
          {noMarketsAvailable && <NoMarketsAvailable>No markets available.</NoMarketsAvailable>}
          {showFilteringInlineLoading && <InlineLoading message="Loading Markets..." />}
        </ListWrapper>
        <BottomContents>
          <DisplayButtonWrapper>
            <Dropdown
              currentItem={4}
              dirty={true}
              dropdownPosition={DropdownPosition.left}
              items={sizeItems}
              placeholder={<Display>Display</Display>}
            />
          </DisplayButtonWrapper>
          {RemoteData.hasData(markets) && markets.data.length === 0 ? null : (
            <LoadMoreWrapper>
              <ButtonCircleStyled disabled={disableLoadPrevButton} onClick={onLoadPrevPage}>
                {disableLoadPrevButton ? (
                  <IconChevronLeftDisabled></IconChevronLeftDisabled>
                ) : (
                  <IconChevronLeft></IconChevronLeft>
                )}
              </ButtonCircleStyled>
              <ButtonCircleStyled disabled={disableLoadNextButton} onClick={onLoadNextPage}>
                {disableLoadNextButton ? (
                  <IconChevronRightDisabled></IconChevronRightDisabled>
                ) : (
                  <IconChevronRight></IconChevronRight>
                )}
              </ButtonCircleStyled>
            </LoadMoreWrapper>
          )}
        </BottomContents>
      </ListCard>
    </>
  )
}
