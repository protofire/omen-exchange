import { useInterval } from '@react-corekit/use-interval'
import React, { useCallback, useEffect, useState } from 'react'
import Draggable from 'react-draggable'
import styled from 'styled-components'

import { ConnectedWeb3Context } from '../../hooks/connectedWeb3'
import { RemoteData } from '../../util/remote_data'
import { Button, ButtonCircle, ButtonSelectable, ListCard, ListItem, Loading, SectionTitle } from '../common'
import { IconChevronLeft } from '../common/icons/IconChevronLeft'
import { IconChevronRight } from '../common/icons/IconChevronRight'

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
  width: 100%;
`

const CategoriesButtons = styled.div`
  flex-grow: 1;
  overflow: hidden;
`

const CategoriesButtonsInner = styled.div`
  align-items: center;
  display: flex;
  width: fit-content;
`

const CategoriesControls = styled.div`
  column-gap: 10px;
  display: grid;
  flex-grow: 0;
  flex-shrink: 0;
  grid-template-columns: 1fr 1fr;
  margin-left: 15px;
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
  const [xMove, setxMove] = useState(0)
  const [movingRight, setMoveRightState] = useState(false)
  const [movingLeft, setMoveLeftState] = useState(false)

  useEffect(() => {
    onFilterChange({ category, sortBy, state })
  }, [category, sortBy, state, onFilterChange])

  const showMoreButton = !RemoteData.is.loading(markets) ? (
    <Button disabled={RemoteData.is.reloading(markets)} onClick={onShowMore}>
      {RemoteData.is.reloading(markets) ? 'Loading...' : 'Show more'}
    </Button>
  ) : null

  const categoriesButtonsRef: any = React.createRef()
  const categoriesButtonsInnerRef: any = React.createRef()
  const X_DISPLACEMENT = 5
  const DISPLACEMENT_TIMER = 5

  useInterval(
    () => {
      const widthDiff = categoriesButtonsInnerRef.current.clientWidth - categoriesButtonsRef.current.clientWidth
      const moveResult = xMove - X_DISPLACEMENT

      if (Math.abs(moveResult) > widthDiff) return

      setxMove(moveResult)
    },
    movingRight ? DISPLACEMENT_TIMER : null,
  )

  useInterval(
    () => {
      const moveResult = xMove + X_DISPLACEMENT

      if (moveResult > 0) return

      setxMove(moveResult)
    },
    movingLeft ? DISPLACEMENT_TIMER : null,
  )

  return (
    <>
      <SectionTitle title={'Markets'} />
      <ListCard>
        {context.account && (
          <TopContents>
            <CategoriesWrapper>
              <CategoriesButtons ref={categoriesButtonsRef}>
                <Draggable axis="x" defaultPosition={{ x: 0, y: 0 }} disabled position={{ x: xMove, y: 0 }}>
                  <CategoriesButtonsInner ref={categoriesButtonsInnerRef}>
                    {CATEGORIES.map((item, index) => (
                      <SelectableButton active={item === category} key={index} onClick={() => setCategory(item)}>
                        {item}
                      </SelectableButton>
                    ))}
                  </CategoriesButtonsInner>
                </Draggable>
              </CategoriesButtons>
              <CategoriesControls>
                <ButtonCircle onMouseDown={() => setMoveLeftState(true)} onMouseUp={() => setMoveLeftState(false)}>
                  <IconChevronLeft />
                </ButtonCircle>
                <ButtonCircle onMouseDown={() => setMoveRightState(true)} onMouseUp={() => setMoveRightState(false)}>
                  <IconChevronRight />
                </ButtonCircle>
              </CategoriesControls>
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
