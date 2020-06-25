import React from 'react'
import styled from 'styled-components'

const MainWrapperStyled = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
`

export const MainWrapper: React.FC = props => {
  const { children, ...restProps } = props

  return <MainWrapperStyled {...restProps}>{children}</MainWrapperStyled>
}
