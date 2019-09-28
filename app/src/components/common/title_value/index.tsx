import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

const Wrapper = styled.div``

const Title = styled.h2`
  color: #000;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.33;
  margin: 0;
`

const Value = styled.p`
  color: #333;
  font-size: 14px;
  font-weight: normal;
  line-height: 1.36;
  margin: 0;

  a {
    color: #333;
    text-decoration: underline;

    &:hover {
      text-decoration: none;
    }
  }
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  title: string
  value: any
}

export const TitleValue: React.FC<Props> = (props: Props) => {
  const { title, value, ...restProps } = props

  return (
    <Wrapper {...restProps}>
      <Title>{title}</Title>
      <Value>{value}</Value>
    </Wrapper>
  )
}
