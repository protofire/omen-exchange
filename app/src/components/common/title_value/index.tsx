import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 0 0 10px;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    flex-direction: row;
    margin-bottom: 0;
  }
`

const Title = styled.h2`
  color: ${props => props.theme.colors.textColorDarker};
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  margin: 0 5px 5px 0;
  white-space: nowrap;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    margin-bottom: 0;
  }
`

const Value = styled.p`
  color: ${props => props.theme.colors.textColor};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  margin: 0;

  a {
    color: ${props => props.theme.colors.textColor};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
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
