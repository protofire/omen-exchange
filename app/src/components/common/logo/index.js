import React from 'react'
import styled from 'styled-components'
import logoImage from './img/logo.png'

const LogoStyled = styled.div`
  background-image: url(${logoImage});
  background-position: 50% 50%;
  background-repeat: no-repeat;
  background-size: contain;
  flex-shrink: 0;
  height: 35px;
  width: 98px;
`

const Logo = props => {
  const { ...restProps } = props

  return <LogoStyled {...restProps} />
}

export { Logo }
