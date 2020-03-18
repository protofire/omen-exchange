import React from 'react'
import styled from 'styled-components'

const Grid = styled.div`
  display: grid;
  grid-column-gap: 22px;
  grid-row-gap: 20px;
  grid-template-columns: 1fr;
  margin-bottom: 20px;
  margin-top: 24px;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    grid-template-columns: 1fr 1fr;
  }
`

export const GridTransactionDetails: React.FC = props => {
  const { children, ...restProps } = props

  return <Grid {...restProps}>{children}</Grid>
}
