import React from 'react'
import styled from 'styled-components'

import { TYPE } from '../../../../theme'

const Table = styled.div`
  width: 100%;
  grid-template-columns: 1fr 1fr;
  border: ${props => props.theme.borders.borderLineDisabled};
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
      border-bottom: ${props => props.theme.borders.borderLineDisabled};
    }
  }

  @media (min-width: ${props => props.theme.themeBreakPoints.xl}) {
    &:nth-child(odd) {
      border-width: 0px 1px 1px 0; /* top right bottom left */
      border-style: solid;
      border-color: ${props => props.theme.colors.verticalDivider};
    }

    &:nth-child(even) {
      border-width: 0 0 1px 1px; /* top right bottom left */
      border-style: solid;
      border-color: ${props => props.theme.colors.verticalDivider};
    }

    :last-child,
    :nth-last-child(2):nth-child(odd) {
      border-bottom: none;
    }
  }
`

const TextData = styled(TYPE.bodyRegular)`
  color: ${props => props.theme.text2};
`

interface Props {
  outcomes: (string | number)[][]
}

export const ResponsiveTableSimple = (props: Props) => {
  const { outcomes } = props

  return (
    <Table>
      {outcomes.map((item: any) => {
        return (
          <TableData key={item}>
            <TextData>{item[0]}</TextData>
            <TextData>{item[1]}</TextData>
          </TableData>
        )
      })}
    </Table>
  )
}
