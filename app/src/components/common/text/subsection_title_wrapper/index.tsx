import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: nowrap;

  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    align-items: flex-start;
    flex-direction: column;
    & > * + * {
      margin-top: 20px;
    }
  }
`

export const SubsectionTitleWrapper: React.FC = props => {
  const { children, ...restProps } = props

  return <Wrapper {...restProps}>{children}</Wrapper>
}
