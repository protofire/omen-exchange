import React from 'react'
import styled from 'styled-components'
import { NavLink, RouteComponentProps } from 'react-router-dom'
import { ConnectedWeb3 } from '../../../hooks/connectedWeb3'
import { MainMenuItem } from '../main_menu_item'

const MainMenuWrapper = styled.div`
  background-color: #fff;
  box-shadow: 0 3px 8px 0 rgba(0, 0, 0, 0.22);
  display: flex;
  flex-direction: column;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    background-color: transparent;
    box-shadow: none;
    flex-direction: row;
  }
`

const Item = styled(NavLink)`
  ${MainMenuItem}
`

export const MainMenu: React.FC<RouteComponentProps> = (props: RouteComponentProps) => {
  const { ...restProps } = props

  return (
    <MainMenuWrapper {...restProps}>
      <Item activeClassName={props.location.pathname === '/' ? 'active' : ''} to="/">
        Markets Overview
      </Item>
      <ConnectedWeb3>
        <Item activeClassName={props.location.pathname === '/create' ? 'active' : ''} to="/create">
          Create market
        </Item>
      </ConnectedWeb3>
    </MainMenuWrapper>
  )
}
