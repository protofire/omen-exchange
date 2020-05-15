import React, { DOMAttributes } from 'react'
import styled from 'styled-components'

const Wrapper = styled.span`
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  font-size: 14px;
  font-weight: normal;
  line-height: 1.2;

  &:hover {
    text-decoration: underline;
  }
`

export const SubsectionTitleAction: React.FC<DOMAttributes<HTMLSpanElement>> = props => {
  const { children, onClick, ...restProps } = props

  return (
    <Wrapper className="subsectionTitleAction" onClick={onClick} {...restProps}>
      {children}
    </Wrapper>
  )
}
