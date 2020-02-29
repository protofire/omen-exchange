import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

const CardStyled = styled.div<{ noPadding?: boolean }>`
  background-color: ${props => props.theme.cards.backgroundColor};
  border-radius: ${props => props.theme.cards.borderRadius};
  border: ${props => props.theme.cards.border};
  box-shadow: ${props => props.theme.cards.boxShadow};
  display: flex;
  flex-direction: column;
  ${props =>
    props.noPadding
      ? 'padding: 0'
      : 'padding: ' + props.theme.cards.paddingVertical + ' ' + props.theme.cards.paddingHorizontal + ';'}
`

CardStyled.defaultProps = {
  noPadding: false,
}

const Title = styled.h2<{ titleAlign?: string }>`
  color: ${props => props.theme.cards.titleColor};
  font-size: 16px;
  font-weight: 700;
  line-height: 1.31;
  margin: 0;
  text-align: ${props => props.titleAlign};
`

Title.defaultProps = {
  titleAlign: 'left',
}

const Body = styled.div`
  color: ${props => props.theme.cards.textColor};
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  noPadding?: boolean
  title?: string
  titleAlign?: string
}

export const Card: React.FC<Props> = (props: Props) => {
  const { children, noPadding, title, titleAlign, ...restProps } = props
  return (
    <CardStyled noPadding={noPadding} {...restProps}>
      {title ? <Title titleAlign={titleAlign}>{title}</Title> : null}
      <Body>{children}</Body>
    </CardStyled>
  )
}
