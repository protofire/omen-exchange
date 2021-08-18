import React from 'react'
import styled from 'styled-components'

const RoundTagStyle = styled.div`
  border-radius: 32px;
  border: 1px solid #5c6bc0;
`

export const RoundTag = (props: any) => {
  const { children, ...restProps } = props

  return <RoundTagStyle {...restProps}>{children}</RoundTagStyle>
}
