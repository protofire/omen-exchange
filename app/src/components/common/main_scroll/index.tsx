import * as React from 'react'
import styled from 'styled-components'

import { IS_CORONA_VERSION } from '../../../common/constants'
import { Footer } from '../footer'

const MainScrollStyled = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: auto;
  padding-bottom: 25px;
  padding-top: 30px;
  position: relative;
  z-index: 2;
`

const MainScrollInner = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-shrink: 0;
  margin: 0 auto;
  max-width: 100%;
  padding-left: 10px;
  padding-right: 10px;
  width: ${props => props.theme.themeBreakPoints.xxl};

  @media (min-width: ${props => props.theme.themeBreakPoints.xl}) {
    padding-left: ${props => props.theme.paddings.mainPadding};
    padding-right: ${props => props.theme.paddings.mainPadding};
  }
`

export const MainScroll: React.FC = props => {
  const { children, ...restProps } = props

  return (
    <MainScrollStyled {...restProps}>
      <MainScrollInner>{children}</MainScrollInner>
      {IS_CORONA_VERSION && <Footer />}
    </MainScrollStyled>
  )
}
