import React, { useCallback, useState } from 'react'
import styled from 'styled-components'

import {
  DISCLAIMER_TEXT,
  LINK_COOKIE_POLICY,
  LINK_FAQ,
  LINK_PRIVACY_POLICY,
  LINK_TERMS_AND_CONDITIONS,
  SHOW_FOOTER,
} from '../../../../common/constants'
import { Button } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'

const Wrapper = styled.div`
  align-items: flex-end;
  color: ${props => props.theme.colors.textColor};
  display: flex;
  flex-shrink: 0;
  font-size: 14px;
  height: 40px;
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

const Disclaimer = styled.div`
  align-items: center;
  background: rgba(128, 128, 128, 0.9);
  bottom: 0;
  display: flex;
  flex-direction: column;
  min-height: 40px;
  justify-content: center;
  left: 0;
  position: fixed;
  right: 0;
  z-index: 5;
`

const DisclaimerText = styled.div`
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  max-width: 900px;
  padding: 10px;
  text-align: center;
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.3);
`

const ButtonStyled = styled(Button)`
  font-size: 12px;
  height: 20px;
  margin-bottom: 10px;
`

enum DisclaimerStates {
  hidden = 'hidden',
  visible = 'visible',
}

export const Footer = () => {
  const storage = window.localStorage
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState<string | null>(storage.getItem('acceptedDisclaimer'))

  const toggleDisclaimer = useCallback(() => {
    const toggledDisclaimerState =
      acceptedDisclaimer === null || acceptedDisclaimer === DisclaimerStates.visible
        ? DisclaimerStates.hidden
        : DisclaimerStates.visible

    setAcceptedDisclaimer(toggledDisclaimerState)
    storage.setItem('acceptedDisclaimer', toggledDisclaimerState)
  }, [acceptedDisclaimer, storage])

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
        {DISCLAIMER_TEXT && (
          <Link as="span" onClick={toggleDisclaimer}>
            Disclaimer
          </Link>
        )}
      </Wrapper>
      {DISCLAIMER_TEXT && acceptedDisclaimer !== DisclaimerStates.hidden && (
        <Disclaimer>
          <DisclaimerText>
            <strong>Disclaimer:</strong> {DISCLAIMER_TEXT}
          </DisclaimerText>
          <ButtonStyled buttonType={ButtonType.primaryLine} onClick={toggleDisclaimer}>
            OK
          </ButtonStyled>
        </Disclaimer>
      )}
    </>
  ) : null
}
