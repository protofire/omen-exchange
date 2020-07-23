import React, { DOMAttributes, useCallback, useEffect, useState } from 'react'
import styled, { css } from 'styled-components'

import { CardCSS } from '../../card'
import { CommonDisabledCSS } from '../common_styled'

import { ChevronDown } from './img/ChevronDown'
import { ChevronUp } from './img/ChevronUp'

export enum DropdownPosition {
  left,
  right,
  center,
}
export enum DropdownVariant {
  pill,
  card,
}

export enum DropdownDirection {
  downwards,
  upwards,
}

const DropdownOpenCSS = css`
  &,
  &:hover {
    background: ${props => props.theme.colors.mainBodyBackground};
    border-color: ${props => props.theme.dropdown.buttonBorderColorHover};
    z-index: 12345;
    .currentItem {
      color: ${props => props.theme.colors.primary};
      font-weight: 500;
    }
  }
  .chevronUp {
    display: block;
  }
  .chevronDown {
    display: none;
  }
`

const DropdownVariantCardOpenCSS = css`
  &,
  &:hover {
    border-color: #9fa8da;
    z-index: 12345;
    .currentItem {
      color: ${props => props.theme.colors.primary};
      font-weight: 500;
    }
  }
  .chevronUp {
    display: block;
  }
  .chevronDown {
    display: none;
  }
`

const DropdownDisabledCSS = css`
  ${CommonDisabledCSS}
  &:disabled,
  &[disabled],
  &[disabled]:hover,
  &:disabled:hover {
    .currentItem {
      color: ${props => props.theme.form.common.disabled.color};
    }
  }
`

const DropdownVariantPillCSS = css`
  border-radius: 32px;
  height: 34px;
  padding: 0 14px;
  border: 1px solid ${props => props.theme.dropdown.buttonBorderColor};
`

const DropdownVariantCardCSS = css`
  ${CardCSS}
  flex: 1;
  padding: 13px 25px;
  position: relative;
  border: 1px solid #dcdff2;
  text-transform: capitalize;
`

const Wrapper = styled.div<{ isOpen: boolean; disabled: boolean; dropdownVariant?: DropdownVariant }>`
  background-color: ${props => props.theme.dropdown.buttonBackgroundColor};
  box-sizing: border-box;
  color: ${props => props.theme.dropdown.buttonColor};
  cursor: pointer;
  outline: none;
  pointer-events: ${props => (props.disabled ? 'none' : 'initial')};
  position: relative;
  transition: border-color 0.15s ease-out;
  user-select: none;

  .chevronUp {
    display: none;
  }

  &:hover {
    background-color: ${props => props.theme.dropdown.buttonBackgroundColor};
    border-color: ${props =>
      props.dropdownVariant === DropdownVariant.card ? '#9fa8da' : props.theme.dropdown.buttonBorderColorHover};
    color: ${props => props.theme.dropdown.buttonColorHover};
  }

  ${props =>
    props.isOpen ? (props.dropdownVariant === DropdownVariant.card ? DropdownVariantCardOpenCSS : DropdownOpenCSS) : ''}
  ${props => (props.disabled ? DropdownDisabledCSS : '')}
  ${props => (props.dropdownVariant === DropdownVariant.pill ? DropdownVariantPillCSS : '')}
  ${props => (props.dropdownVariant === DropdownVariant.card ? DropdownVariantCardCSS : '')}
 
`

const DropdownButton = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: space-between;
`

const CurrentItem = styled.div`
  align-items: center;
  justify-content: space-between;
  color: ${props => props.theme.dropdown.buttonColor};
  display: flex;
  flex-grow: 1;
  flex-shrink: 0;
  font-size: 14px;
  font-weight: normal;
  height: 20px;
  line-height: 1.2;
  margin: 0 10px 0 0;
  max-width: calc(100% - 20px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const DropdownPositionLeftCSS = css`
  margin-top: 10px;
  left: 0;
`

const DropdownPositionRightCSS = css`
  margin-top: 10px;
  right: 0;
`

const DropdownPositionCenterCSS = css`
  left: 50%;
  transform: translateX(-50%);
`

const DropdownDirectionDownwardsCSS = css`
  top: calc(100% + 10px);
`

const DropdownDirectionUpwardsCSS = css`
  bottom: calc(100% + 10px);
`

const DropdownVariantPillItemsCSS = css`
  border: 0;
`
const DropdownVariantCardItemsCSS = css`
  max-height: 218px;
  overflow-y: auto;
`
const DropdownVariantCardItemsContainerCSS = css`
  border-radius: 8px;
  border: 1px solid #dcdff2;
  width: 100%;
  left: 0;
`

const ItemsContainer = styled.div<{
  isOpen: boolean
  dropdownPosition?: DropdownPosition
  dropdownDirection?: DropdownDirection
  dropdownVariant?: DropdownVariant
}>`
  background-color: ${props => props.theme.dropdown.dropdownItems.backgroundColor};
  border-radius: ${props => props.theme.dropdown.dropdownItems.borderRadius};
  border: solid 1px ${props => props.theme.dropdown.dropdownItems.borderColor};
  box-shadow: ${props => props.theme.dropdown.dropdownItems.boxShadow};
  display: ${props => (props.isOpen ? 'block' : 'none')};
  min-width: 164px;
  padding: ${props => (props.dropdownVariant === DropdownVariant.card ? '12px 8px' : '12px 0')};
  position: absolute;
  ${props => (props.dropdownVariant === DropdownVariant.card ? DropdownVariantCardItemsContainerCSS : '')};
  ${props => (props.dropdownPosition === DropdownPosition.left ? DropdownPositionLeftCSS : '')};
  ${props => (props.dropdownPosition === DropdownPosition.right ? DropdownPositionRightCSS : '')};
  ${props => (props.dropdownPosition === DropdownPosition.center ? DropdownPositionCenterCSS : '')};
  ${props => (props.dropdownDirection === DropdownDirection.downwards ? DropdownDirectionDownwardsCSS : '')};
  ${props => (props.dropdownDirection === DropdownDirection.upwards ? DropdownDirectionUpwardsCSS : '')};
`

const DropdownScrollbarCSS = css`
  margin-right: 0;
  &::-webkit-scrollbar-track {
    background: #f3f4fb;
    border-radius: 2px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #9fa9d8;
    border-radius: 2px;
  }
  &::-webkit-scrollbar {
    width: 4px;
  }
`

const Items = styled.div<{
  dropdownVariant?: DropdownVariant
  showScrollbar?: boolean
}>`
  ${props => (props.dropdownVariant === DropdownVariant.pill ? DropdownVariantPillItemsCSS : '')};
  ${props => props.dropdownVariant === DropdownVariant.card && 'margin-right: -8px'};
  ${props => (props.dropdownVariant === DropdownVariant.card ? DropdownVariantCardItemsCSS : '')};
  ${props => props.showScrollbar && DropdownScrollbarCSS}
`

const SecondaryText = styled.div`
  color: #757575;
  width: 33%;
  text-align: right;
`

Items.defaultProps = {
  dropdownVariant: DropdownVariant.pill,
}

const Item = styled.div<{ active: boolean; dropdownVariant?: DropdownVariant }>`
  align-items: center;
  justify-content: space-between;
  background-color: ${props =>
    props.active
      ? props.dropdownVariant === DropdownVariant.card
        ? '#F8F9FC'
        : props.theme.dropdown.dropdownItems.item.backgroundColorActive
      : props.theme.dropdown.dropdownItems.item.backgroundColor};
  color: ${props =>
    props.dropdownVariant === DropdownVariant.card && !props.active
      ? '#757575'
      : props.theme.dropdown.dropdownItems.item.color};
  cursor: pointer;
  display: flex;
  height: 48px;
  padding: ${props => (props.dropdownVariant === DropdownVariant.card ? '9px 14px' : '12px 17px')};
  margin: ${props => (props.dropdownVariant === DropdownVariant.card ? '0 8px 0 0' : '0')};
  border-radius: ${props => (props.dropdownVariant === DropdownVariant.card ? '8px' : '0')};

  &:hover {
    color: ${props => props.theme.dropdown.dropdownItems.item.color};
    background: ${props =>
      props.dropdownVariant === DropdownVariant.card
        ? '#F8F9FC'
        : props.theme.dropdown.dropdownItems.item.backgroundColorHover};
    div {
      color: #39474f;
    }
  }
`

const ChevronWrapper = styled.div`
  flex-shrink: 0;
`

export interface DropdownItemProps {
  content: React.ReactNode | string
  secondaryText?: React.ReactNode | string
  onClick?: () => void
}

interface Props extends DOMAttributes<HTMLDivElement> {
  currentItem?: number | undefined
  dropdownVariant?: DropdownVariant | undefined
  dirty?: boolean
  disabled?: boolean
  dropdownPosition?: DropdownPosition | undefined
  dropdownDirection?: DropdownDirection | undefined
  showScrollbar?: boolean
  items: any
  placeholder?: React.ReactNode | string | undefined
}

export const Dropdown: React.FC<Props> = props => {
  const {
    currentItem = 0,
    dirty = false,
    disabled = false,
    dropdownVariant = DropdownVariant.pill,
    dropdownDirection,
    dropdownPosition,
    items,
    placeholder,
    showScrollbar = false,
    ...restProps
  } = props

  const getValidItemIndex = (itemIndex: number): number => {
    const outOfBounds = itemIndex && (itemIndex > items.length - 1 || itemIndex < 0)
    if (outOfBounds) {
      return 0
    }
    return itemIndex
  }

  const getItem = (itemIndex: number): any => {
    return items[getValidItemIndex(itemIndex)]
  }

  const [currentItemIndex, setCurrentItemIndex] = useState<number>(currentItem)
  const [isDirty, setIsDirty] = useState<boolean>(dirty)
  const [isOpen, setIsOpen] = useState<boolean>(false)

  useEffect(() => {
    setCurrentItemIndex(currentItem)
  }, [currentItem])

  const optionClick = useCallback((onClick: (() => void) | undefined, itemIndex: number) => {
    if (!onClick) return

    setCurrentItemIndex(itemIndex)
    onClick()
    setIsDirty(true)
    setIsOpen(false)
  }, [])

  const onWrapperClick = useCallback(() => {
    if (isOpen) {
      setIsOpen(false)
    } else {
      setIsOpen(true)
    }
  }, [isOpen])

  const activeItem = getItem(currentItemIndex)

  return (
    <>
      <Wrapper
        disabled={disabled}
        dropdownVariant={dropdownVariant}
        isOpen={isOpen}
        onBlur={() => {
          setIsOpen(false)
        }}
        onClick={onWrapperClick}
        tabIndex={-1}
        {...restProps}
      >
        <DropdownButton>
          <CurrentItem className="currentItem">
            {placeholder && !isDirty ? placeholder : activeItem.content}
            {!!activeItem.secondaryText && <SecondaryText>{activeItem.secondaryText}</SecondaryText>}
          </CurrentItem>
          <ChevronWrapper>
            <ChevronDown />
            <ChevronUp />
          </ChevronWrapper>
        </DropdownButton>
        <ItemsContainer
          className="dropdownItems"
          dropdownDirection={dropdownDirection}
          dropdownPosition={dropdownPosition}
          dropdownVariant={dropdownVariant}
          isOpen={isOpen}
          // onScroll={e => {
          // if (!!e.target.scrollHeight && e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight) {
          // reached bottom of picker
          // }
          // }}
        >
          <Items dropdownVariant={dropdownVariant} showScrollbar={showScrollbar}>
            {items.map((item: DropdownItemProps, index: string) => {
              return (
                <Item
                  active={parseInt(index) === currentItemIndex}
                  dropdownVariant={dropdownVariant}
                  key={index}
                  onClick={
                    item.onClick !== undefined
                      ? () => optionClick(item.onClick, parseInt(index))
                      : () => setIsOpen(false)
                  }
                >
                  {item.content}
                  {!!item.secondaryText && <SecondaryText>{item.secondaryText}</SecondaryText>}
                </Item>
              )
            })}
          </Items>
        </ItemsContainer>
      </Wrapper>
    </>
  )
}
