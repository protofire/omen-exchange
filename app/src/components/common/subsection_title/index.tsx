import React, { DOMAttributes } from 'react'
import styled from 'styled-components'

const SubsectionTitleWrapper = styled.h2`
  color: ${props => props.theme.colors.textColorDarker};
  font-size: 16px;
  font-weight: 400;
  line-height: 1.2;
  margin: 0;

  a {
    color: ${props => props.theme.colors.textColorDarker};
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
