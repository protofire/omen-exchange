import React, { ButtonHTMLAttributes } from 'react'
import styled, { css } from 'styled-components'

const ActiveCSS = css`
  &,
  &:hover {
    background-color: ${props => props.theme.colors.secondary};
    border-color: ${props => props.theme.colors.secondary};

    > svg path {
      fill: ${props => props.theme.colors.primary};
    }
  }
`

const Wrapper = styled.button<{ active?: boolean }>`
  align-items: center;
  background-color: #fff;
  border-radius: 50%;
  border: 1px solid ${props => props.theme.colors.tertiary};
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  height: ${props => props.theme.buttonCircle.dimensions};
  justify-content: center;
  outline: none;
  padding: 0;
  transition: border-color 0.15s linear;
  user-select: none;
  width: ${props => props.theme.buttonCircle.dimensions};

  &:hover {
    border-color: ${props => props.theme.colors.tertiaryDark};
  }

  ${props => (props.active ? ActiveCSS : '')};

  &[disabled] {
    &,
    &:hover {
      border-color: ${props => props.theme.colors.tertiary};
      cursor: not-allowed;
      opacity: 0.5;
    }
  }
`

Wrapper.defaultProps = {
  active: false,
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

export const ButtonCircle: React.FC<Props> = props => {
  const { children, ...restProps } = props

  return <Wrapper {...restProps}>{children}</Wrapper>
}
