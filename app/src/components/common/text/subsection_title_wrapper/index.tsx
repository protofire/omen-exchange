import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 20px;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    flex-wrap: nowrap;
  }
`

export const SubsectionTitleWrapper: React.FC = props => {
  const { children, ...restProps } = props

  return <Wrapper {...restProps}>{children}</Wrapper>
}
