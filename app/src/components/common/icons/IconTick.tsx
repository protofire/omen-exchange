import React from 'react'
import styled from 'styled-components'
interface Props {
  disabled?: boolean
  selected?: boolean
}
const StyledSvg = styled.svg<{ disabled?: boolean; selected?: boolean }>`
  filter: ${props => (props.selected ? 'saturate(0) brightness(2)' : props.disabled ? 'saturate(0)' : '')};
  cursor: ${props => (props.disabled ? 'initial' : 'pointer')};
`

export const IconTick = (props: Props) => {
  const { disabled = false, selected = false } = props
  return (
    <StyledSvg
      disabled={disabled}
      fill="none"
      height="14"
      selected={selected}
      viewBox="0 0 20 14"
      width="20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.82644 10.8688L2.66115 6.70355L1.27272 8.09198L6.82644 13.6457L18.7273 1.74488L17.3388 0.356445L6.82644 10.8688Z"
        fill="#7986CB"
        stroke="#7986CB"
        strokeWidth="0.5"
      />
    </StyledSvg>
  )
}
