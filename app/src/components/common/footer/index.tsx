import React, { useCallback, useState } from 'react'
import styled from 'styled-components'

import { Button } from '../../button'
import { ButtonType } from '../../button/button_styling_types'

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

  return (
    <>
      <Wrapper>
        <Link href="#" target="_blank">
          Privacy Policy
        </Link>
        <Break>-</Break>
        <Link
          href="https://docs.google.com/document/d/e/2PACX-1vQ_iFS4LhM89B_f7gxuZO3OjqAKIPLP2ODZBn26Fe88tHwc3KTM144cUr-r56C2RVS1_9JTBquFgSDn/pub"
          target="_blank"
        >
          Terms &amp; Conditions
        </Link>
        <Break>-</Break>
        <Link href="https://docs.google.com/document/d/1w-mzDZBHqedSCxt_T319e-JzO5jFOMwsGseyCOqFwqQ" target="_blank">
          FAQ
        </Link>
        <Break>-</Break>
        <Link as="span" onClick={toggleDisclaimer}>
          Disclaimer
        </Link>
      </Wrapper>
      {acceptedDisclaimer !== DisclaimerStates.hidden && (
        <Disclaimer>
          <DisclaimerText>
            <strong>Disclaimer:</strong> This site, its content and features (together, the &quot;Corona Information
            Markets&quot;) are provided on a strictly NON-PROFIT NON-FEE BASIS, AS IS and AT YOUR OWN RISK for the sole
            purpose of fighting the COVID-19 pandemic. Reliance on the Corona Information Markets for medical or other
            professional guidance or their commercial use is strictly prohibited. Participation in the markets can
            result in financial loss.
          </DisclaimerText>
          <ButtonStyled buttonType={ButtonType.primaryLine} onClick={toggleDisclaimer}>
            OK
          </ButtonStyled>
        </Disclaimer>
      )}
    </>
  )
}
