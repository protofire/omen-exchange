import React, { DOMAttributes } from 'react'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'

import { formatDate } from '../../../../util/tools'

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 0px;
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

const Value = styled.div`
  color: ${props => props.theme.colors.textColor};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  margin: 0;
  text-align: right;

  a {
    color: ${props => props.theme.colors.textColor};
    text-decoration: underline;

    &:hover {
      text-decoration: none;
    }
  }
`

interface Props extends DOMAttributes<HTMLDivElement> {
  title: string
  value: any
}

export const DisplayResolution: React.FC<Props> = (props: Props) => {
  const { title, value, ...restProps } = props

  return (
    <Wrapper {...restProps}>
      <Title>{title}</Title>
      <Value
        data-class="customTooltip"
        data-delay-hide="500"
        data-effect="solid"
        data-for="walletBalanceTooltip"
        data-multiline={true}
        data-place="top"
        data-tip={`Spend your total balance on the selected outcome.`}
      >
        {' '}
        {formatDate(value)}{' '}
      </Value>
      <ReactTooltip id="walletBalanceTooltip" />
    </Wrapper>
  )
}
