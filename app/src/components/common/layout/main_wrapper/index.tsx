import React from 'react'
import GoogleAnalytics from 'react-ga'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'

const MainWrapperStyled = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
`
const usePageViews = () => {
  const location = useLocation()

  React.useEffect(() => {
    GoogleAnalytics.send(['pageview', location.pathname])
  }, [location])
}
export const MainWrapper: React.FC = props => {
  const { children, ...restProps } = props
  usePageViews()

  return <MainWrapperStyled {...restProps}>{children}</MainWrapperStyled>
}
