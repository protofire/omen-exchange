import { css } from 'styled-components'

const Separator = css`
  &::after {
    background-color: ${props => props.theme.header.color};
    content: '';
    height: 22px;
    margin: 0 20px;
    width: 1px;
  }

  &:last-child::after {
    display: none;
  }
`

export const MainMenuItem = css`
  align-items: center;
  color: ${props => props.theme.header.color};
  cursor: pointer;
  display: flex;
  font-size: 15px;
  font-weight: 400;
  height: 45px;
  justify-content: center;
  margin: 0;
  text-align: center;
  text-decoration: none;
  text-transform: uppercase;

  &:active,
  &.active {
    background-color: ${props => props.theme.colors.primary};
    color: #fff;
    font-weight: 500;
  }

  &:active {
    opacity: 0.8;
  }

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    font-size: 14px;
    height: ${props => props.theme.header.height};
    justify-content: flex-start;
    margin: 0;

    ${Separator}

    &:active,
    &.active {
      background-color: transparent;
      color: ${props => props.theme.colors.primary};
    }

    &:active {
      opacity: 1;
    }
  }
`
