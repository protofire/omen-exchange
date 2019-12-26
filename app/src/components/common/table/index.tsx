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
      background-color: ${props => props.theme.borders.borderColor};
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

export const TR = styled.tr`
  th,
  td {
    &:first-child {
      padding-left: 0;
    }

    &:last-child {
      padding-right: 0;
    }
  }
`

export const TH = styled.th<{ textAlign?: string }>`
  border: none;
  color: #999;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
  padding: 14px 10px;
  text-align: ${props => props.textAlign};
  white-space: nowrap;
`

TH.defaultProps = {
  textAlign: 'left',
}

export const TD = styled.td<{ textAlign?: string }>`
  border-bottom: solid 1px #d5d5d5;
  border-left: none;
  border-right: none;
  border-top: none;
  color: #000;
  font-size: 13px;
  font-weight: normal;
  line-height: 1.2;
  padding: 14px 10px;
  text-align: ${props => props.textAlign};
`

TD.defaultProps = {
  textAlign: 'left',
}

export const TBody = styled.tbody``

interface Props extends HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode
  head?: React.ReactNode
  maxHeight?: string
}

export const Table: React.FC<Props> = (props: Props) => {
  const { head, children, maxHeight, ...restProps } = props
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
