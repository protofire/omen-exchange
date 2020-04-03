import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  align-items: center;
  color: ${props => props.theme.colors.textColor};
  display: flex;
  font-size: 14px;
  height: 40px;
  justify-content: center;
  line-height: 1.2;
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

export const Footer = () => (
  <Wrapper>
    <Link href="#" target="_blank">
      Privacy Policy
    </Link>
    <Break>-</Break>
    <Link href="#" target="_blank">
      Terms &amp; Conditions
    </Link>
    <Break>-</Break>
    <Link href="https://docs.google.com/document/d/1w-mzDZBHqedSCxt_T319e-JzO5jFOMwsGseyCOqFwqQ" target="_blank">
      FAQ
    </Link>
    <Break>-</Break>
    <Link as="span">Disclaimer</Link>
  </Wrapper>
)
