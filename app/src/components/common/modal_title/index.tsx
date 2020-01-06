import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'
import CloseIcon from './img/close.svg'

interface Props extends HTMLAttributes<HTMLDivElement> {
  disableCloseButton?: boolean
  onClick?: any
  title: string
}

const ModalTitleWrapper = styled.div`
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  margin: 0 0 20px;
  padding: 0;
`

const ModalTitleText = styled.h2`
  color: ${props => props.theme.colors.commonText};
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
  overflow: hidden;
  padding: 0 10px 0 0;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const ModalClose = styled.button`
  align-items: flex-start;
  background-color: transparent;
  background-image: url(${CloseIcon});
  background-position: 100% 0;
  background-repeat: no-repeat;
  border: none;
  cursor: pointer;
  display: flex;
  height: 24px;
  justify-content: flex-end;
  outline: none;
  padding: 0;
  width: 24px;

  &:active {
    opacity: 0.8;
  }

  &[disabled] {
    cursor: not-allowed;
    opacity: 0.5;
  }
`

class ModalTitle extends React.Component<Props> {
  public render = () => {
    const { onClick, title, disableCloseButton, ...restProps } = this.props

    return (
      <ModalTitleWrapper {...restProps}>
        <ModalTitleText>{title}</ModalTitleText>
        <ModalClose onClick={onClick} disabled={disableCloseButton} />
      </ModalTitleWrapper>
    )
  }
}

export default ModalTitle
