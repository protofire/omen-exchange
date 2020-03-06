import React, { DOMAttributes } from 'react'
import styled from 'styled-components'

const SubsectionTitleWrapper = styled.h2`
  color: #000;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.33;
  margin: 0 0 15px;

  a {
    color: #000;
    text-decoration: underline;

    &:hover {
      text-decoration: none;
    }
  }
`

export const SubsectionTitle: React.FC<DOMAttributes<HTMLDivElement>> = props => {
  const { children, ...restProps } = props

  return <SubsectionTitleWrapper {...restProps}>{children}</SubsectionTitleWrapper>
}
