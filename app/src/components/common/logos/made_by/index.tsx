import React from 'react'
import styled from 'styled-components'

import Logo from './img/logo.svg'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  padding-top: 20px;
  width: 100%;
`

const Text = styled.p`
  color: ${props => props.theme.colors.textColor};
  font-size: 14px;
  font-weight: normal;
  line-height: 1.2;
  margin: 0 0 0 8px;
`

const Link = styled.a`
  color: ${props => props.theme.colors.textColorDark};
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
`

export const MadeBy = () => (
  <Wrapper>
    <img alt="" src={Logo} />
    <Text>
      Made by{' '}
      <Link href="https://dxdao.eth.link/" rel="noopener noreferrer" target="_blank">
        DXdao
      </Link>
    </Text>
  </Wrapper>
)
