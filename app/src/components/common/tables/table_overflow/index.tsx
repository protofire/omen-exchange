import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

const TableOverflowWrapper = styled.div<{ maxHeight?: string }>`
  overflow-x: auto;
  max-height: ${props => (props.maxHeight ? props.maxHeight : 'none')};
  width: 100%;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  maxHeight?: string
}

export const TableOverflow: React.FC<Props> = (props: Props) => {
  const { children, ...restProps } = props

  return <TableOverflowWrapper {...restProps}>{children}</TableOverflowWrapper>
}
