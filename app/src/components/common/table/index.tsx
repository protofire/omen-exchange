import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

import { TableOverflow } from '../table_overflow'

const TableWrapper = styled.table<{ stickyHeader?: boolean }>`
  border: none;
  margin: 0;
  position: relative;
  width: 100%;

  th {
    background-color: #fff;
    position: ${props => (props.stickyHeader ? 'sticky' : 'relative')};
    top: 0;
    z-index: 12;

    &::before {
      background-color: #e8eaf6;
      content: '';
      height: 1px;
      left: 0;
      position: absolute;
      right: 0;
      top: 0;
    }

    &::after {
      background-color: #e8eaf6;
      bottom: 0;
      content: '';
      height: 1px;
      left: 0;
      position: absolute;
      right: 0;
    }
  }
`

export const THead = styled.thead``

export const TR = styled.tr``

export const TH = styled.th<{ textAlign?: string }>`
  border: none;
  color: ${props => props.theme.colors.textColor};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  padding: 12px 25px;
  text-align: ${props => props.textAlign};
  white-space: nowrap;
`

TH.defaultProps = {
  textAlign: 'left',
}

export const TD = styled.td<{ textAlign?: string; withBorder?: boolean }>`
  border-bottom: ${props => (props.withBorder ? 'solid 1px #E8EAF6' : 'none')};
  border-left: none;
  border-right: none;
  border-top: none;
  color: ${props => props.theme.colors.textColorDark};
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  padding: 20px 25px;
  text-align: ${props => props.textAlign};
`

TD.defaultProps = {
  textAlign: 'left',
  withBorder: true,
}

export const TBody = styled.tbody``

interface Props extends HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode
  head?: React.ReactNode
  maxHeight?: string
}

export const Table: React.FC<Props> = (props: Props) => {
  const { children, head, maxHeight, ...restProps } = props
  const stickyHeader: boolean = maxHeight ? true : false

  return (
    <TableOverflow maxHeight={maxHeight}>
      <TableWrapper stickyHeader={stickyHeader} {...restProps}>
        {head ? head : null}
        <TBody>{children}</TBody>
      </TableWrapper>
    </TableOverflow>
  )
}
