import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.svg<{ hoverEffect: boolean | undefined }>`
  cursor: pointer;

  // The hover effect happens here. I tested your solution on different Icon accross the app and it didn't work. I passed the hoverEffect props in where IconClose was. I believe this solution is better than the one you have proposed and we must pass the hoverEffect arg inside every Icons instance throughout the code. I can do this on a separate PR
  &:hover {
    .path {
      ${props => props.hoverEffect && `fill: ${props.theme.colors.primaryLight};`}
    }
  }

  .path {
    transition: 0.2s fill;
    // fill ${props => (props.hoverEffect ? '#DCDFF2' : '#37474F')};
  }
`

interface Props {
  hoverEffect?: boolean
  onClick?: () => void
  size?: string
  color?: string
}

export const IconClose = (props: Props) => {
  const { color, hoverEffect = false, onClick, size = '24', ...restProps } = props

  return (
    <Wrapper
      // Here we must keep the color arg to colour the cross when there is no hover
      fill={color}
      height={size}
      hoverEffect={hoverEffect}
      onClick={onClick}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...restProps}
    >
      <path
        className="path"
        d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
      />
    </Wrapper>
  )
}
