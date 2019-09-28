import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

const SubsectionTitleWrapper = styled.div`
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

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const SubsectionTitle: React.FC<Props> = (props: Props) => {
  const { children, ...restProps } = props

  return <SubsectionTitleWrapper {...restProps}>{children}</SubsectionTitleWrapper>
}
