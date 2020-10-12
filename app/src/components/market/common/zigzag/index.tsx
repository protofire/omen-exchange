import styled from 'styled-components'

const height = 8
const halfHeight = height / 2
const thickness = '30%'
const offset = 4

export const ZigZag = styled.div`
  position: relative;
  height: ${height}px;
  z-index: 1;
  margin: 0 -22px;
  margin-bottom: 7.5%;
  border-left: 1px solid ${props => props.theme.borders.borderColor};
  border-right: 1px solid ${props => props.theme.borders.borderColor};
  &:before,
  &:after {
    content: '';
    display: block;
    position: absolute;
    left: 0;
    right: 0;
  }
  &:before {
    height: ${height - offset}px;
    top: ${thickness};
    background: ${({
      theme,
    }) => `linear-gradient(-135deg, ${theme.borders.borderColor} ${halfHeight}px, transparent 0) 0 ${halfHeight}px,
      linear-gradient(135deg, ${theme.borders.borderColor} ${halfHeight}px, transparent 0) 0 ${halfHeight}px`};
    background-position: top left;
    background-repeat: repeat-x;
    background-size: ${height}px ${height}px;
  }
  &:after {
    height: ${height}px;
    top: 10%;
    background: linear-gradient(-135deg, #fff ${halfHeight}px, transparent 0) 0 ${halfHeight}px,
      linear-gradient(135deg, #fff ${halfHeight}px, transparent 0) 0 ${halfHeight}px;
    background-position: top left;
    background-repeat: repeat-x;
    background-size: ${height}px ${height}px;
  }
`
