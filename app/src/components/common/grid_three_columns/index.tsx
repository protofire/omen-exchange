import React from 'react'
import styled from 'styled-components'

const Grid = styled.div`
  display: grid;
  grid-column-gap: 20px;
  grid-row-gap: 14px;
  grid-template-columns: 1fr 1fr 1fr;
  margin-bottom: 25px;
`

export const GridThreeColumns: React.FC = props => {
  const { children, ...restProps } = props

  return <Grid {...restProps}>{children}</Grid>
}
