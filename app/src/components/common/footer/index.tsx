import React from 'react'
import styled from 'styled-components'
import LogoProtofire from './img/logo.png'

const FooterStyled = styled.footer`
  margin-top: auto;
  padding-top: 50px;
`

const AFooter = styled.a`
  align-items: center;
  cursor: pointer;
  display: flex;
  justify-content: center;
  text-decoration: none;
`

const AText = styled.span`
  color: ${props => props.theme.footer.color};
  cursor: pointer;
  font-size: 10px;
  font-weight: 600;
  line-height: 1.2;
  margin: 0 8px 0 0;
  text-align: left;
`

const Logo = styled.img`
  cursor: pointer;
  height: 22px;
  width: 90px;
`

export const Footer: React.FC = props => {
  const { ...restProps } = props

  return (
    <FooterStyled {...restProps}>
      <AFooter href="https://www.protofire.io">
        <AText>Built by</AText>
        <Logo src={LogoProtofire} alt="Protofire" />
      </AFooter>
    </FooterStyled>
  )
}
