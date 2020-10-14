import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  border: 1px solid ${props => props.theme.borders.borderDisabled};
  background-color: ${props => props.theme.colors.mainBodyBackground};
  padding: 21px;
  border-bottom: 0;
  background-image: url('data:image/svg+xml;utf8, <svg viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg"><path d="M -15 110 L100 10 L215 110" fill="none" stroke="%23E8EAF6" stroke-width="1" vector-effect="non-scaling-stroke"/></svg>');
  background-position: bottom left;
  background-size: 2.5% auto;
  background-repeat: repeat-x;

  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    background-size: 2% auto;
  }
`

export const TransactionDetailsCard: React.FC = props => {
  const { children, ...restProps } = props

  return <Wrapper {...restProps}>{children}</Wrapper>
}
