import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
`

const Icon = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  margin-right: 8px;
  max-height: 100%;

  svg {
    max-height: 100%;
  }
`

const Text = styled.div`
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  icon: any
  text: string
}

export const TokenItem: React.FC<Props> = props => {
  const { icon, text } = props
  return (
    <Wrapper>
      <Icon>{icon}</Icon>
      <Text>{text}</Text>
    </Wrapper>
  )
}
