import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'
import MenuIcon from './img/menu.svg'
import { MainMenu } from '../main_menu'

const MobileMenuWrapper = styled.div`
  display: flex;
`

const MobileMenuButton = styled.button`
  background-color: transparent;
  background-image: url(${MenuIcon});
  background-position: 50% 50%;
  background-repeat: no-repeat;
  border: none;
  cursor: pointer;
  height: ${props => props.theme.header.height};
  margin: 0;
  outline: none;
  padding: 0;
  width: 25px;

  &:active {
    opacity: 0.5;
  }
`

const MobileMenuOpacityContainer = styled.div`
  background-color: rgba(0, 0, 0, 0.35);
  height: calc(100vh - ${props => props.theme.header.height});
  justify-content: center;
  left: 0;
  overflow: hidden;
  position: fixed;
  top: ${props => props.theme.header.height};
  width: 100vw;
  z-index: 12345;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  isMenuOpen: boolean
  toggleMenu: any
}

export const MobileMenu: React.FC<Props> = (props: Props) => {
  const { isMenuOpen, toggleMenu, ...restProps } = props

  return (
    <MobileMenuWrapper {...restProps}>
      <MobileMenuButton onClick={toggleMenu} />
      {isMenuOpen ? (
        <MobileMenuOpacityContainer onClick={toggleMenu}>
          <MainMenu />
        </MobileMenuOpacityContainer>
      ) : null}
    </MobileMenuWrapper>
  )
}
