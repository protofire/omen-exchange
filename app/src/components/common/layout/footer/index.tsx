import React from 'react'
import styled from 'styled-components'

import {
  LINK_COOKIE_POLICY,
  LINK_FAQ,
  LINK_PRIVACY_POLICY,
  LINK_TERMS_AND_CONDITIONS,
  SHOW_FOOTER,
} from '../../../../common/constants'
import { CookiesBanner } from '../../cookies_banner'
import { Disclaimer } from '../../disclaimer'

const Wrapper = styled.div`
  align-items: flex-end;
  color: ${props => props.theme.colors.textColor};
  display: flex;
  flex-shrink: 0;
  font-size: 14px;
  height: 50px;
  justify-content: center;
  line-height: 1.2;
  width: 100%;
`

const Link = styled.a`
  color: ${props => props.theme.colors.textColor};
  cursor: pointer;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const Break = styled.span`
  margin: 0 8px;

  &:last-child {
    display: none;
  }
`

export const Footer = () => {
  return SHOW_FOOTER ? (
    <>
      <Wrapper>
        {LINK_PRIVACY_POLICY && (
          <>
            <Link href={LINK_PRIVACY_POLICY} target="_blank">
              Privacy Policy
            </Link>
            <Break>-</Break>
          </>
        )}
        {LINK_TERMS_AND_CONDITIONS && (
          <>
            <Link href={LINK_TERMS_AND_CONDITIONS} target="_blank">
              Terms &amp; Conditions
            </Link>
            <Break>-</Break>
          </>
        )}
        {LINK_COOKIE_POLICY && (
          <>
            <Link href={LINK_COOKIE_POLICY} target="_blank">
              Cookie Policy
            </Link>
            <Break>-</Break>
          </>
        )}
        {LINK_FAQ && (
          <>
            <Link href={LINK_FAQ} target="_blank">
              FAQ
            </Link>
            <Break>-</Break>
          </>
        )}
      </Wrapper>
      <Disclaimer />
      <CookiesBanner />
    </>
  ) : null
}
