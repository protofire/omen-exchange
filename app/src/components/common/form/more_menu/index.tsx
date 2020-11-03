import React, { DOMAttributes, useCallback, useState } from 'react'
import styled, { css } from 'styled-components'

import { IconMore } from '../../icons'

const MoreButtonWidth = '40px'

const Wrapper = styled.div`
  position: relative;
  display: inline-block;
  outline: none;
`

const MoreButton = styled.div<{ isOpen: boolean }>`
  width: ${MoreButtonWidth};
  height: ${MoreButtonWidth};
  border-radius: 8px;
  border: 1px solid ${({ isOpen, theme }) => (isOpen ? theme.moreMenu.buttonBorderActive : theme.moreMenu.buttonBorder)};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  ${({ isOpen, theme }) =>
    !isOpen &&
    `&:hover {
    border-color: ${theme.moreMenu.buttonBorderHover};
  }`}
`

const ItemsContainer = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 4321;
  box-shadow: ${({ theme }) => theme.moreMenu.boxShadow};
  border: 1px solid ${({ theme }) => theme.moreMenu.items.border};
  background-color: ${({ theme }) => theme.moreMenu.items.backgroundColor};
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  padding: 8px;
  border-radius: 12px;
  @media (max-width: ${props => props.theme.themeBreakPoints.sm}) {
    right: unset;
    left: 0;
  }
`

const DropdownScrollbarCSS = css`
  margin-right: 0;
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.slider.idle};
    border-radius: 2px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${props => props.theme.slider.active};
    border-radius: 2px;
  }
  &::-webkit-scrollbar {
    width: 4px;
  }
`

const Items = styled.div`
  overflow-y: auto;
  min-width: 100px;
  max-height: 200px;
  ${DropdownScrollbarCSS}
  & > * + * {
    margin-top: 8px;
  }
`

const Item = styled.div`
  align-items: center;
  justify-content: space-between;
  color: ${props => props.theme.moreMenu.item.color};
  cursor: pointer;
  display: flex;
  padding: 11px 12px;
  margin: 0;
  border-radius: 8px;
  white-space: nowrap;
  text-align: left;
  min-width: 147px;
  font-size: 14px;
  line-height: 16px;

  &:hover {
    color: ${props => props.theme.moreMenu.item.colorHover};
    background: ${props => props.theme.moreMenu.item.backgroundColorHover};
  }
`

export interface MoreMenuItemProps {
  content: React.ReactNode | string
  onClick?: () => void
}

interface Props extends DOMAttributes<HTMLDivElement> {
  items: MoreMenuItemProps[]
}

export const MoreMenu: React.FC<Props> = props => {
  const { items, ...restProps } = props
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const onWrapperClick = useCallback(() => {
    if (isOpen) {
      setIsOpen(false)
    } else {
      setIsOpen(true)
    }
  }, [isOpen])

  return (
    <Wrapper
      onBlur={() => {
        setIsOpen(false)
      }}
      onClick={onWrapperClick}
      tabIndex={-1}
      {...restProps}
    >
      <MoreButton isOpen={isOpen}>
        <IconMore />
      </MoreButton>
      <ItemsContainer isOpen={isOpen}>
        <Items>
          {items.map((item: MoreMenuItemProps, index: number) => (
            <Item key={index} onClick={item.onClick}>
              {item.content}
            </Item>
          ))}
        </Items>
      </ItemsContainer>
    </Wrapper>
  )
}
