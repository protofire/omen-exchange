import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

const ParagraphWrapper = styled.div`
  color: #555;
  font-size: 14px;
  font-weight: normal;
  line-height: 1.36;
  margin: 0 0 20px;
  text-align: left;

  &:last-child {
    margin-bottom: 0;
  }

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

export const Paragraph: React.FC<Props> = (props: Props) => {
  const { children, ...restProps } = props

  return <ParagraphWrapper {...restProps}>{children}</ParagraphWrapper>
}
