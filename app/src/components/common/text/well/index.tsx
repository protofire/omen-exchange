import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

const WellWrapper = styled.div`
  background-color: #f6f6f6;
  border-radius: 3px;
  color: #555;
  font-size: 14px;
  font-weight: normal;
  line-height: 1.36;
  padding: 12px 15px;

  a {
    color: #555;
    text-decoration: underline;

    &:hover {
      text-decoration: none;
    }
  }
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const Well: React.FC<Props> = (props: Props) => {
  const { children, ...restProps } = props

  return <WellWrapper {...restProps}>{children}</WellWrapper>
}
