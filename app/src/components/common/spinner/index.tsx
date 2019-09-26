import React, { HTMLAttributes } from 'react'
import styled, { keyframes } from 'styled-components'
import SpinnerSVG from './img/spinner.svg'

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const RotatingSpinner = styled.div<{ height: string; width: string }>`
  animation: ${rotate} 4s linear infinite;
  height: ${props => props.height};
  width: ${props => props.width};
`

RotatingSpinner.defaultProps = {
  height: '40px',
  width: '40px',
}

const SpinnerIcon = styled.img`
  height: 100%;
  width: 100%;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  color?: string
  height?: string
  width?: string
}

export const Spinner: React.FC<Props> = (props: Props) => {
  const { width = '', height = '', color = '#fff', ...restProps } = props

  return (
    <RotatingSpinner width={width} height={height} color={color} {...restProps}>
      <SpinnerIcon src={SpinnerSVG} alt="" />
    </RotatingSpinner>
  )
}
