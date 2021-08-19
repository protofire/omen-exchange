import React from 'react'
import styled from 'styled-components'

import { TYPE } from '../../../../theme'

const RoundTagStyle = styled.div`
  border-radius: 32px;
  border: 1px solid #5c6bc0;
`
const Table = styled.div`
  width: 100%;
  flex-wrap: wrap;
  display: flex;
  border-radius: 6px;
  border: 1px solid black;
`
const TableData = styled.div`
  display: flex;
  // border: 1px solid black;
  width: 50%;
  padding: 10px 16px;
  justify-content: space-between;
`
interface Props {
  outcomes: (string | number)[][]
}

export const RoundTag = (props: Props) => {
  const { outcomes } = props

  return (
    <Table>
      {outcomes.map((item: any) => {
        return (
          <TableData key={item}>
            <div>{item[0]}</div>
            <div>{item[1]}</div>
          </TableData>
        )
      })}
    </Table>
  )
}
