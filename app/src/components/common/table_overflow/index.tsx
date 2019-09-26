import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

const TableOverflowWrapper = styled.div`
  overflow-x: auto;
  width: 100%;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: any
}

export const TableOverflow: React.FC<Props> = (props: Props) => {
  const { children, ...restProps } = props

  return <TableOverflowWrapper {...restProps}>{children}</TableOverflowWrapper>
}
