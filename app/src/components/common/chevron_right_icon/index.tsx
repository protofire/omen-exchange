import React from 'react'
import styled from 'styled-components'

import ChevronRightSVG from './img/chevron-right.svg'

const Icon = styled.div`
  background-image: url(${ChevronRightSVG});
  background-position: 50% 50%;
  background-repeat: no-repeat;
  background-size: contain;
  height: 24px;
  width: 13.39px;
`

const ChevronRightIconWrapper = styled.div``

export const ChevronRightIcon: React.FC = props => {
  const { ...restProps } = props
  return (
    <ChevronRightIconWrapper {...restProps}>
      <Icon />
    </ChevronRightIconWrapper>
  )
}
