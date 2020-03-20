import React, { DOMAttributes, createRef, useCallback, useEffect, useState } from 'react'
import styled, { css } from 'styled-components'

import { ChevronDown } from './img/ChevronDown'
import { ChevronUp } from './img/ChevronUp'

export enum DropdownPosition {
  left,
  right,
  center,
}

export enum DropdownDirection {
  downwards,
  upwards,
}

const Wrapper = styled.div<{ active?: boolean }>`
  background-color: #fff;
  border-radius: 32px;
  border: 1px solid ${props => props.theme.colors.tertiary};
  box-sizing: border-box;
  cursor: pointer;
  height: 34px;
  outline: none;
  padding: 0 14px;
  position: relative;
  user-select: none;

  .chevronUp {
    display: none;
  }

  &:focus-within {
    background: ${props => props.theme.colors.secondary};
    z-index: 12345;

    .currentItem {
      color: ${props => props.theme.colors.primary};
    }

    .dropdownItems {
      display: block;
    }

    .chevronUp {
      display: block;
    }

    .chevronDown {
      display: none;
    }
  }
`

const DropdownButton = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: space-between;
`

const CurrentItem = styled.div`
  align-items: center;
  color: ${props => props.theme.colors.textColorDark};
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
  left: 0;
`

const DropdownPositionRightCSS = css`
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

const Items = styled.div<{ dropdownPosition?: DropdownPosition; dropdownDirection?: DropdownDirection }>`
  background-color: #fff;
  border-radius: 16px;
  border: solid 1px ${props => props.theme.borders.borderColor};
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.12);
  display: none;
  min-width: 240px;
  padding: 12px 0;
  position: absolute;

  ${props => (props.dropdownPosition === DropdownPosition.left ? DropdownPositionLeftCSS : '')}
  ${props => (props.dropdownPosition === DropdownPosition.right ? DropdownPositionRightCSS : '')}
  ${props => (props.dropdownPosition === DropdownPosition.center ? DropdownPositionCenterCSS : '')}

  ${props => (props.dropdownDirection === DropdownDirection.downwards ? DropdownDirectionDownwardsCSS : '')}
  ${props => (props.dropdownDirection === DropdownDirection.upwards ? DropdownDirectionUpwardsCSS : '')}
`

Items.defaultProps = {
  dropdownPosition: DropdownPosition.left,
  dropdownDirection: DropdownDirection.downwards,
}

const Item = styled.div<{ active: boolean }>`
  align-items: center;
  background-color: ${props => (props.active ? 'rgba(227, 242, 253, 0.4)' : 'transparent')};
  cursor: pointer;
  display: flex;
  height: 48px;
  padding: 12px 17px;

  &:hover {
    background: rgba(227, 242, 253, 0.4);
  }
`

const ChevronWrapper = styled.div`
  flex-shrink: 0;
`

const HelperFocusItem = styled.span`
  height: 0;
  line-height: 0;
  width: 0;
  position: absolute;
  z-index: -123456;
`

export interface DropdownItemProps {
  content: React.ReactNode | string
  onClick: () => void
}

interface Props extends DOMAttributes<HTMLDivElement> {
  currentItem?: number | undefined
  dropdownPosition?: DropdownPosition | undefined
  dropdownDirection?: DropdownDirection | undefined
  items: any
  onClick?: () => void
  placeholder?: React.ReactNode | string | undefined
}

export const Dropdown: React.FC<Props> = props => {
  const { currentItem, dropdownDirection, dropdownPosition, items, onClick, placeholder, ...restProps } = props
  const myRef = createRef<HTMLDivElement>()
  const [currentItemIndex, setCurrentItemIndex] = useState<number | undefined>(currentItem)
  const [isDirty, setIsDirty] = useState<boolean>(false)

  const closeDropdown = useCallback(() => {
    if (myRef.current) {
      myRef.current.focus()
    }
  }, [myRef])

  const optionClick = useCallback(
    (onClick: () => void, itemIndex: number) => {
      setCurrentItemIndex(itemIndex)
      onClick()
      setIsDirty(true)
      closeDropdown()
    },
    [closeDropdown],
  )

  useEffect(() => {
    if (!placeholder && !currentItemIndex && !isDirty) {
      setCurrentItemIndex(0)
    }
  }, [currentItemIndex, isDirty, placeholder])

  return (
    <>
      <HelperFocusItem ref={myRef} tabIndex={-1} />
      <Wrapper onClick={onClick} tabIndex={-1} {...restProps}>
        <DropdownButton>
          <CurrentItem className="currentItem">
            {placeholder && !isDirty ? placeholder : items[currentItemIndex || 0].content}
          </CurrentItem>
          <ChevronWrapper>
            <ChevronDown />
            <ChevronUp />
          </ChevronWrapper>
        </DropdownButton>
        <Items className="dropdownItems" dropdownDirection={dropdownDirection} dropdownPosition={dropdownPosition}>
          {items.map((item: DropdownItemProps, index: string) => {
            return (
              <Item
                active={parseInt(index) === currentItemIndex}
                key={index}
                onClick={() => optionClick(item.onClick, parseInt(index))}
              >
                {item.content}
              </Item>
            )
          })}
        </Items>
      </Wrapper>
    </>
  )
}
