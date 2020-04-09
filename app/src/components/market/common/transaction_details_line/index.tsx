import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  background-color: ${props => props.theme.borders.borderColorLighter};
  height: 1px;
  line-height: 1px;
  margin: 0 0 14px;
`

export const TransactionDetailsLine: React.FC = props => <Wrapper {...props} />
