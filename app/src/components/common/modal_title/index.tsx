import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

import CloseIcon from './img/close.svg'

interface Props extends HTMLAttributes<HTMLDivElement> {
  disableCloseButton?: boolean
  onClick?: any
  title: string
}

const CLOSE_BUTTON_DIMENSIONS = '34px'

const ModalTitleWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 0;
`

const ModalTitleText = styled.h2`
  color: ${props => props.theme.colors.textColorDark};
  font-family: ${props => props.theme.fonts.fontFamily};
  font-size: 17px;
  font-weight: 500;
  line-height: 1.2;
  margin: 0 auto;
  overflow: hidden;
  padding: 0 5px 0 ${CLOSE_BUTTON_DIMENSIONS};
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const ModalClose = styled.button`
  background-color: transparent;
  background-image: url(${CloseIcon});
  background-position: 50% 50%;
  background-repeat: no-repeat;
  border-radius: 50%;
  border: 1px solid ${props => props.theme.colors.tertiary};
  cursor: pointer;
  display: flex;
  height: ${CLOSE_BUTTON_DIMENSIONS};
  outline: none;
  padding: 0;
  transition: border-color 0.15s linear;
  width: ${CLOSE_BUTTON_DIMENSIONS};

  &:hover {
    border-color: ${props => props.theme.colors.tertiaryDark};
  }

  &[disabled] {
    &,
    &:hover {
      border-color: ${props => props.theme.colors.tertiary};
      cursor: not-allowed;
      opacity: 0.5;
    }
  }
`

class ModalTitle extends React.Component<Props> {
  public render = () => {
    const { disableCloseButton, onClick, title, ...restProps } = this.props

    return (
      <ModalTitleWrapper {...restProps}>
        <ModalTitleText>{title}</ModalTitleText>
        <ModalClose disabled={disableCloseButton} onClick={onClick} />
      </ModalTitleWrapper>
    )
  }
}

export default ModalTitle
