import React, { DOMAttributes } from 'react'
import styled from 'styled-components'

export enum ValueStates {
  error,
  important,
  normal,
  success,
}

const Wrapper = styled.div`
  display: flex;
  font-size: 14px;
  justify-content: space-between;
  letter-spacing: 0.4px;
  line-height: 1.2;
  margin: 0 0 14px;

  &:last-child {
    margin-bottom: 0;
  }
`

const Title = styled.h4`
  color: #424242;
  font-weight: 400;
  margin: 0;
  opacity: 0.9;
`

const Value = styled.p<{ state: ValueStates; emphasizeValue?: boolean }>`
  color: ${props =>
    (!props.emphasizeValue && props.state === ValueStates.success && props.theme.colors.textColorLightish) ||
    (props.state === ValueStates.success && props.theme.colors.green) ||
    (props.state === ValueStates.error && props.theme.colors.error) ||
    (props.state === ValueStates.important && props.theme.colors.textColorDark) ||
    props.theme.colors.textColorLightish};
    };
  font-weight: ${props => (props.emphasizeValue ? '500' : '400')};
  margin: 0;
`

interface Props extends DOMAttributes<HTMLDivElement> {
  emphasizeValue?: boolean
  state?: ValueStates
  title: string
  value: any
}

export const TransactionDetailsRow: React.FC<Props> = props => {
  const { emphasizeValue = false, state = ValueStates.normal, title, value, ...restProps } = props

  return (
    <Wrapper {...restProps}>
      <Title>{title}</Title>
      <Value emphasizeValue={emphasizeValue} state={state}>
        {value}
      </Value>
    </Wrapper>
  )
}
