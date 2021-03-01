import { Jazzicon } from '@ukstv/jazzicon-react'
import React from 'react'
import styled from 'styled-components'

interface Props {
  size?: number
  account: string
}
const JazzWrapper = styled.div<{ size: number }>`
  height: ${props => `${props.size}px;`};
  width: ${props => `${props.size}px;`};
`

export const IconJazz = (props: Props) => {
  const { account, size = 20 } = props
  return (
    <JazzWrapper size={size}>
      <Jazzicon address={account} />
    </JazzWrapper>
  )
}
