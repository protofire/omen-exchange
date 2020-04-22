import React, { useCallback, useEffect, useState } from 'react'
import GoogleAnalytics from 'react-ga'
import styled from 'styled-components'

import { GOOGLE_ANALYTICS_ID, LINK_COOKIE_POLICY } from '../../../common/constants'
import { getLogger } from '../../../util/logger'
import { Button } from '../../button/button'

const logger = getLogger('Analytics::Google')

const Wrapper = styled.div`
  background-color: rgba(255, 255, 255, 0.9);
  bottom: 0;
  box-shadow: 0 2px 4px 0 rgba(212, 212, 211, 0.8);
  border-top: 1px solid ${props => props.theme.borders.borderColor};
  display: flex;
  justify-content: center;
  left: 0;
  min-height: 50px;
  padding: 15px;
  position: fixed;
  width: 100%;
  z-index: 12;
`

const Content = styled.div`
  max-width: 100%;
  width: ${props => props.theme.themeBreakPoints.xxl};
`

const Text = styled.p`
  color: ${props => props.theme.colors.textColorDarker};
  font-size: 15px;
  font-weight: normal;
  line-height: 1.5;
  margin: 0 0 20px;
  text-align: center;
`

const Link = styled.a`
  color: ${props => props.theme.colors.textColorDarker};
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
`

const ButtonContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`

enum AnalyticsStates {
  notaccepted = 'notaccepted',
  accepted = 'accepted',
}

export const CookiesBanner = () => {
  const storage = window.localStorage
  const loadAnalyticsKey = 'loadAnalytics'

  const [loadAnalytics, setLoadAnalytics] = useState<string>(
    storage.getItem(loadAnalyticsKey) === null || storage.getItem(loadAnalyticsKey) === AnalyticsStates.notaccepted
      ? AnalyticsStates.notaccepted
      : AnalyticsStates.accepted,
  )

  const loadGoogleAnalytics = useCallback(() => {
    if (!GOOGLE_ANALYTICS_ID) {
      logger.error(
        '[GoogleAnalytics] - In order to use Google analytics you need to add a trackingID using REACT_APP_GOOGLE_ANALYTICS_ID',
      )
      return
    }

    logger.log('Loading Google Analytics...')

    GoogleAnalytics.initialize(GOOGLE_ANALYTICS_ID)
    GoogleAnalytics.set({ anonymizeIp: true })
  }, [])

  const acceptCookies = useCallback(() => {
    setLoadAnalytics(AnalyticsStates.accepted)
    storage.setItem(loadAnalyticsKey, AnalyticsStates.accepted)
  }, [storage])

  useEffect(() => {
    if (loadAnalytics === AnalyticsStates.accepted) {
      loadGoogleAnalytics()
    }
  }, [loadAnalytics, loadGoogleAnalytics])

  return LINK_COOKIE_POLICY && loadAnalytics === AnalyticsStates.notaccepted ? (
    <Wrapper>
      <Content>
        <Text>
          We use cookies to give you the best experience and to help improve our website. Please read our{' '}
          <Link href={LINK_COOKIE_POLICY} target="_blank">
            Cookie Policy
          </Link>{' '}
          for more information. By clicking &quot;Accept Cookies&quot;, you agree to the storing of cookies on your
          device to enhance site navigation, analyze site usage and provide customer support.
        </Text>
        <ButtonContainer>
          <Button onClick={acceptCookies}>Accept Cookies</Button>
        </ButtonContainer>
      </Content>
    </Wrapper>
  ) : null
}
