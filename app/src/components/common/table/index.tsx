import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'
import { TableOverflow } from '../table_overflow'

const TableWrapper = styled.table`
  border: none;
  margin: 0;
  width: 100%;
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
  border-bottom: solid 1px #d5d5d5;
  border-left: none;
  border-right: none;
  border-top: none;
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
  head?: React.ReactNode
  children: React.ReactNode
}

export const Table: React.FC<Props> = (props: Props) => {
  const { head, children, ...restProps } = props

  return (
    <TableOverflow>
      <TableWrapper {...restProps}>
        {head ? head : null}
        <TBody>{children}</TBody>
      </TableWrapper>
    </TableOverflow>
  )
}
