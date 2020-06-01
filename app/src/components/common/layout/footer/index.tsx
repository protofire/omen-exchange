import React from 'react'
import styled from 'styled-components'

import {
  DISCLAIMER_TEXT,
  IS_CORONA_VERSION,
  LINK_COOKIE_POLICY,
  LINK_FAQ,
  LINK_PRIVACY_POLICY,
  LINK_TERMS_AND_CONDITIONS,
  SHOW_FOOTER,
} from '../../../../common/constants'
import { CookiesBanner } from '../../cookies_banner'
import { Disclaimer } from '../../disclaimer'
import { SponsoredBy } from '../../logos/sponsored_by'

const Wrapper = styled.div<{ paddingBottomSmall?: boolean }>`
  align-items: center;
  color: ${props => props.theme.colors.textColorDarker};
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  font-size: 14px;
  justify-content: center;
  line-height: 1.2;
  padding-bottom: ${props => (props.paddingBottomSmall ? '10px' : '30px')};
  padding-top: 10px;
  width: 100%;
`

const Link = styled.a`
  color: ${props => props.theme.colors.textColor};
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
`

const Break = styled.span`
  font-weight: 700;
  margin: 0 8px;

  &:last-child {
    display: none;
  }
`

const SponsoredByStyled = styled(SponsoredBy)`
  margin-left: 15px;
`

export const Footer = () => {
  const appVersion = '1.0'

  return SHOW_FOOTER ? (
    <>
      {IS_CORONA_VERSION ? (
        <Wrapper>
          {LINK_PRIVACY_POLICY && (
            <>
              <Link href={LINK_PRIVACY_POLICY} target="_blank">
                Privacy Policy
              </Link>
              <Break>·</Break>
            </>
          )}
          {LINK_TERMS_AND_CONDITIONS && (
            <>
              <Link href={LINK_TERMS_AND_CONDITIONS} target="_blank">
                Terms &amp; Conditions
              </Link>
              <Break>·</Break>
            </>
          )}
          {LINK_COOKIE_POLICY && (
            <>
              <Link href={LINK_COOKIE_POLICY} target="_blank">
                Cookie Policy
              </Link>
              <Break>·</Break>
            </>
          )}
          {LINK_FAQ && (
            <>
              <Link href={LINK_FAQ} target="_blank">
                FAQ
              </Link>
            </>
          )}
          <SponsoredByStyled />
        </Wrapper>
      ) : (
        <Wrapper paddingBottomSmall={DISCLAIMER_TEXT ? true : false}>
          <Link href={'#'}>Version {appVersion}</Link>
          <Break>·</Break>
          <Link href={'#'}>Omen Contract</Link>
          <Break>·</Break>
          <Link href="http://alchemy.daostack.io/dao/0x519b70055af55a007110b4ff99b0ea33071c720a">Propose Token</Link>
          <Break>·</Break>
          <Link href="https://dxdao.eth.link" target="_blank">
            DXdao.eth
          </Link>
        </Wrapper>
      )}
      <Disclaimer />
      <CookiesBanner />
    </>
  ) : null
}
