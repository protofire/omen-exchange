import React from 'react'
import styled, { css } from 'styled-components'

import { GIT_COMMIT } from '../../../common/constants'

import LogoImageGeco from './img/logo_geco.png'
import LogoImageProtofire from './img/logo_protofire.png'

const FooterStyled = styled.footer`
  margin: auto 0 0 0;
  padding-top: 50px;
`

const FooterCss = css`
  align-items: center;
  display: flex;
  justify-content: center;
  text-decoration: none;
`

const FooterGeco = styled.a`
  display: block;
  margin: 0 20px 0 0;
`

const FooterProtofire = styled.a`
  ${FooterCss}
`

const Text = styled.span`
  color: ${props => props.theme.footer.color};
  cursor: pointer;
  font-size: 10px;
  font-weight: 600;
  line-height: 1.2;
  margin: 0 8px 0 0;
  text-align: left;
`

const LogoProtofire = styled.img`
  cursor: pointer;
  height: 22px;
  width: 90px;
`

const LogoGeco = styled.img`
  display: block;
  height: 45px;
`

export const Footer: React.FC = props => {
  const { ...restProps } = props

  return (
    <FooterStyled title={GIT_COMMIT} {...restProps}>
      <FooterGeco>
        <LogoGeco alt="Geco" src={LogoImageGeco} />
      </FooterGeco>
      <FooterProtofire href="https://www.protofire.io">
        <Text>Built by</Text>
        <LogoProtofire alt="Protofire" src={LogoImageProtofire} />
      </FooterProtofire>
    </FooterStyled>
  )
}
