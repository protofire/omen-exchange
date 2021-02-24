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
}

export const IconArrowBack = (props: Props) => {
  const { hoverEffect = false, onClick } = props

  return (
    <Wrapper
      fill="none"
      height="24"
      hoverEffect={hoverEffect}
      onClick={onClick}
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="path"
        d="M21 11H6.83L10.41 7.41L9 6L3 12L9 18L10.41 16.59L6.83 13H21V11Z"
        fill={hoverEffect ? '#DCDFF2' : '#37474F'}
      />
    </Wrapper>
  )
}
