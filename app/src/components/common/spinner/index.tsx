import React, { HTMLAttributes } from 'react'
import styled, { keyframes } from 'styled-components'

import SpinnerSVG from './img/spinnerMain.svg'

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const RotatingSpinner = styled.div<{ height: string | undefined; width: string | undefined }>`
  animation: ${rotate} 2s linear infinite;
  flex-grow: 0;
  flex-shrink: 0;
  height: ${props => props.height};
  width: ${props => props.width};
`

RotatingSpinner.defaultProps = {
  height: '45px',
  width: '45px',
}

const SpinnerIcon = styled.img`
  height: 100%;
  width: 100%;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  color?: string
  height?: string | undefined
  width?: string | undefined
}

export const Spinner: React.FC<Props> = (props: Props) => {
  const { color = '#fff', height, width, ...restProps } = props

  return (
    <RotatingSpinner color={color} height={height} width={width} {...restProps}>
      <SpinnerIcon alt="Loading..." src={SpinnerSVG} />
    </RotatingSpinner>
  )
}
