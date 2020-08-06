import React from 'react'
import styled from 'styled-components'

const Grid = styled.div`
  display: grid;
  grid-column-gap: 24px;
  grid-row-gap: 12px;
  grid-template-columns: 1fr;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    grid-template-columns: 1fr 1fr;
  }
`

export const GridTwoColumns: React.FC = props => {
  const { children, ...restProps } = props

  return <Grid {...restProps}>{children}</Grid>
}
