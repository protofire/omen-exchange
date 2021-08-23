import React from 'react'
import styled from 'styled-components'

import { TYPE } from '../../../../theme'

const Table = styled.div`
  width: 100%;

  grid-template-columns: 1fr 1fr;
  border: 1px solid #e8eaf6;
  border-radius: 6px;
  display: grid;
  @media (max-width: ${props => props.theme.themeBreakPoints.xl}) {
    grid-template-columns: 1fr;
  }
`
const TableData = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 16px;
  text-align: center;
  margin: 0 -1px -1px 0;
  @media (max-width: ${props => props.theme.themeBreakPoints.xl}) {
    :not(:last-child) {
      border-bottom: 1px solid #e8eaf6;
    }
  }

  @media (min-width: ${props => props.theme.themeBreakPoints.xl}) {
    &:nth-child(odd) {
      border-width: 0px 1px 1px 0; /* top right bottom left */
      border-style: solid;
      border-color: #e8eaf6;
    }

    &:nth-child(even) {
      border-width: 0 0 1px 1px; /* top right bottom left */
      border-style: solid;
      border-color: #e8eaf6;
    }

    :last-child,
    :nth-last-child(2):nth-child(odd) {
      border-bottom: none;
    }
  }
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
            <TYPE.bodyRegular color={'text2'}>{item[0]}</TYPE.bodyRegular>
            <TYPE.bodyRegular color={'text2'}>{item[1]}</TYPE.bodyRegular>
          </TableData>
        )
      })}
    </Table>
  )
}
