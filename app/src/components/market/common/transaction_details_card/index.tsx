import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  border: 1px solid ${props => props.theme.borders.borderDisabled};
  background-color: ${props => props.theme.colors.mainBodyBackground};
  padding: 21px;
  margin-bottom: 4px;
  position: relaive;
  border-bottom: 0;
  background-image: url('data:image/svg+xml;utf8, <svg viewBox="0 0 20 11" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M-1.5 11L9.99999 1L21.5 11" stroke="%23E8EAF6" stroke-width="1" vector-effect="non-scaling-stroke"/></svg>');
  background-position: bottom left;
  background-size: 6px auto;
  background-repeat: repeat-x;
`

export const TransactionDetailsCard: React.FC = props => {
  const { children, ...restProps } = props

  return <Wrapper {...restProps}>{children}</Wrapper>
}
