import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.svg<{ hoverEffect: boolean | undefined }>`
  cursor: pointer;

  &:hover {
    .path {
      ${props => props.hoverEffect && `fill: ${props.theme.colors.primaryLight};`}
    }
  }

  .path {
    transition: 0.2s fill;
  }
`

interface Props {
  hoverEffect?: boolean
  onClick?: () => void
  size?: string
  color?: string
}

export const IconClose = (props: Props) => {
  const { color = '#37474F', hoverEffect = false, onClick, size = '24' } = props

  return (
    <Wrapper
      fill="none"
      height={size}
      hoverEffect={hoverEffect}
      onClick={onClick}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="path"
        d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
        fill={hoverEffect ? '#DCDFF2' : color}
      />
    </Wrapper>
  )
}
