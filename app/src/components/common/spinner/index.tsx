import React, { HTMLAttributes } from 'react'
import styled, { keyframes } from 'styled-components'

import { IconSpinner } from '../icons'

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const RotatingSpinner = styled.div`
  animation: ${rotate} 2s linear infinite;
  flex-grow: 0;
  flex-shrink: 0;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  color?: string
  size?: string
  big?: boolean | undefined
}

export const Spinner: React.FC<Props> = (props: Props) => {
  const { big, color = '#fff', size, ...restProps } = props

  return (
    <RotatingSpinner color={color} {...restProps}>
      <IconSpinner spinnerSize={big ? '42' : size ? size : '40'} />
    </RotatingSpinner>
  )
}
