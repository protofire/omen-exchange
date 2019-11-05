import React from 'react'
import styled, { css } from 'styled-components'

import LogoImageProtofire from './img/logo_protofire.png'
import LogoImageGeco from './img/logo_geco.png'
import { GIT_COMMIT } from '../../../common/constants'

const FooterStyled = styled.footer`
  margin-top: auto;
  padding-top: 50px;
`

const FooterCss = css`
  align-items: center;
  display: flex;
  justify-content: center;
  text-decoration: none;
`

const FooterGeco = styled.a`
  ${FooterCss}
`

const FooterProtofire = styled.a`
  ${FooterCss}
  margin-top: 10px
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
  height: 60px;
  margin: 0 10px;
`

export const Footer: React.FC = props => {
  const { ...restProps } = props

  return (
    <FooterStyled title={GIT_COMMIT} {...restProps}>
      <FooterGeco>
        <LogoGeco src={LogoImageGeco} alt="Geco" />
      </FooterGeco>
      <FooterProtofire href="https://www.protofire.io">
        <Text>Built by</Text>
        <LogoProtofire src={LogoImageProtofire} alt="Protofire" />
      </FooterProtofire>
    </FooterStyled>
  )
}
