import * as React from 'react'
import styled from 'styled-components'

const MainScrollStyled = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  align-items: center;
  padding-bottom: 15px;
  padding-top: 64px;
  position: relative;
  z-index: 2;
  padding-left: ${props => props.theme.paddings.mainPadding};
  padding-right: ${props => props.theme.paddings.mainPadding};
  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    overflow: auto;
    overflow-x: hidden;
  }
`

const MainScrollInner = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-shrink: 0;
  margin: 0 auto;
  max-width: 100%;
  align-items: center;
  width: ${props => props.theme.themeBreakPoints.xxl};
`

export const MainScroll: React.FC = props => {
  const { children, ...restProps } = props

  return (
    <MainScrollStyled {...restProps}>
      <MainScrollInner>{children}</MainScrollInner>
    </MainScrollStyled>
  )
}
