import React, { DOMAttributes, createRef, useCallback, useState } from 'react'
import styled, { css } from 'styled-components'

import { ChevronDown } from './img/ChevronDown'
import { ChevronUp } from './img/ChevronUp'

export enum DropdownPosition {
  left,
  right,
  center,
}

const Wrapper = styled.div<{ active?: boolean }>`
  background-color: #fff;
  border-radius: 32px;
  border: 1px solid ${props => props.theme.colors.tertiary};
  box-sizing: border-box;
  cursor: pointer;
  height: 34px;
  outline: none;
  padding: 0 17px;
  position: relative;
  user-select: none;

  .chevronUp {
    display: none;
  }

  &:focus-within {
    background: ${props => props.theme.colors.secondary};

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
  color: ${props => props.theme.colors.textColorDark};
  flex-grow: 1;
  flex-shrink: 0;
  font-size: 14px;
  font-weight: normal;
  line-height: 1.2;
  margin: 0 10px 0 0;
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

const Items = styled.div<{ dropdownPosition?: DropdownPosition }>`
  background-color: #fff;
  border-radius: 16px;
  border: solid 1px ${props => props.theme.borders.borderColor};
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.12);
  display: none;
  min-width: 240px;
  padding: 12px 0;
  position: absolute;
  top: calc(100% + 10px);

  ${props => (props.dropdownPosition === DropdownPosition.left ? DropdownPositionLeftCSS : '')}
  ${props => (props.dropdownPosition === DropdownPosition.right ? DropdownPositionRightCSS : '')}
  ${props => (props.dropdownPosition === DropdownPosition.center ? DropdownPositionCenterCSS : '')}
`

Items.defaultProps = {
  dropdownPosition: DropdownPosition.left,
}

const Item = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  height: 48px;
  padding: 12px 17px;

  &:hover {
    background: rgba(227, 242, 253, 0.4);
  }
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
  currentItem?: number
  items: any
  placeholder?: React.ReactNode | string | undefined
  dropdownPosition?: DropdownPosition | undefined
}

export const Dropdown: React.FC<Props> = props => {
  const { dropdownPosition, currentItem = -1, items, placeholder, ...restProps } = props
  const myRef = createRef<HTMLDivElement>()
  const [currentItemIndex, setCurrentItemIndex] = useState<number>(currentItem)

  const closeDropdown = useCallback(() => {
    if (myRef.current) {
      myRef.current.focus()
    }
  }, [myRef])

  const optionClick = useCallback(
    (onClick: () => void, itemIndex: number) => {
      setCurrentItemIndex(itemIndex)
      onClick()
      closeDropdown()
    },
    [closeDropdown],
  )

  return (
    <>
      <HelperFocusItem ref={myRef} tabIndex={-1} />
      <Wrapper tabIndex={-1} {...restProps}>
        <DropdownButton>
          <CurrentItem className="currentItem">
            {currentItemIndex > -1 ? items[currentItemIndex].content : placeholder}
          </CurrentItem>
          <ChevronDown />
          <ChevronUp />
        </DropdownButton>
        <Items className="dropdownItems" dropdownPosition={dropdownPosition}>
          {items.map((item: DropdownItemProps, index: string) => {
            return (
              <Item key={index} onClick={() => optionClick(item.onClick, parseInt(index))}>
                {item.content}
              </Item>
            )
          })}
        </Items>
      </Wrapper>
    </>
  )
}
