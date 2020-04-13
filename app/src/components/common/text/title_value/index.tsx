import React, { DOMAttributes } from 'react'
import styled from 'styled-components'

export enum ValueStates {
  error,
  normal,
  success,
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 0 0 10px;
`

const Title = styled.h2`
  color: ${props => props.theme.colors.textColorDarker};
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  margin: 0 5px 0 0;
  white-space: nowrap;
`

const Value = styled.p<{ state: ValueStates }>`
  color: ${props =>
    (props.state === ValueStates.success && props.theme.colors.green) ||
    (props.state === ValueStates.error && props.theme.colors.error) ||
    props.theme.colors.textColor};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  margin: 0;
  text-align: right;

  a {
    color: ${props =>
      (props.state === ValueStates.success && props.theme.colors.green) ||
      (props.state === ValueStates.error && props.theme.colors.error) ||
      props.theme.colors.textColor};
    text-decoration: underline;

    &:hover {
      text-decoration: none;
    }
  }
`

interface Props extends DOMAttributes<HTMLDivElement> {
  state?: ValueStates
  title: string
  value: any
}

export const TitleValue: React.FC<Props> = (props: Props) => {
  const { state = ValueStates.normal, title, value, ...restProps } = props

  return (
    <Wrapper {...restProps}>
      <Title>{title}</Title>
      <Value state={state}>{value}</Value>
    </Wrapper>
  )
}
