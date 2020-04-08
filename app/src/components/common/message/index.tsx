import React, { HTMLAttributes, ReactPortal, useCallback, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'

import CloseSVG from './img/close.svg'
import ErrorSVG from './img/error.svg'
import OkSVG from './img/ok.svg'
import WarningSVG from './img/warning.svg'

export enum MessageType {
  default,
  ok,
  error,
  warning,
}

const getBorderColor = (type: MessageType, colors: any): string => {
  return (
    (type === MessageType.ok && colors.primary) ||
    (type === MessageType.error && colors.secondary) ||
    (type === MessageType.warning && colors.warning) ||
    ''
  )
}

const getIcon = (type: MessageType): string => {
  return (
    (type === MessageType.ok && OkSVG) ||
    (type === MessageType.error && ErrorSVG) ||
    (type === MessageType.warning && WarningSVG) ||
    ''
  )
}

const Wrapper = styled.div`
  left: 50%;
  max-width: 100%;
  position: fixed;
  top: 0;
  transform: translateX(-50%);
  z-index: 12345;
`

const MessageWrapper = styled.div<{ type: MessageType }>`
  align-items: center;
  background-color: #fff;
  border-radius: 5px;
  border-style: solid;
  border-width: 1px;
  border-color: ${props =>
    getBorderColor(props.type, props.theme.colors)
      ? getBorderColor(props.type, props.theme.colors)
      : props.theme.borders.borderColor};
  box-shadow: 0 0 18px 0 rgba(0, 0, 0, 0.08);
  display: flex;
  margin-top: 25px;
  max-width: 100%;
  padding: 11px 14px;
  position: relative;
  width: 322px;
`

const Icon = styled.div<{ type: MessageType }>`
  background-image: url(${props => getIcon(props.type)});
  background-position: 50% 50%;
  background-repeat: no-repeat;
  flex-grow: 0;
  flex-shrink: 0;
  height: 25px;
  margin-right: 10px;
  width: 25px;
`

const Text = styled.p`
  color: ${props => props.theme.colors.textColor};
  font-size: 13px;
  font-weight: normal;
  line-height: 1.38;
  margin: 0 10px 0 0;
`

const CloseButton = styled.button`
  background-color: transparent;
  background-image: url(${CloseSVG});
  background-position: 50% 50%;
  background-repeat: no-repeat;
  border: none;
  cursor: pointer;
  height: 24px;
  margin: 0;
  outline: none;
  padding: 0;
  position: absolute;
  right: 0;
  top: 0;
  width: 24px;

  &[disabled] {
    opacity: 0.5;
  }
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  hideCloseButton?: boolean
  hidingTimeout?: number | undefined
  onHide?: () => void
  text: string
  type?: MessageType
}

export const Message: React.FC<Props> = (props: Props): ReactPortal => {
  const { onHide, text, type = MessageType.default, hidingTimeout, hideCloseButton } = props
  const [notificate, setNotificate] = useState(true)

  const hideNotification = useCallback(() => {
    setNotificate(false)
    onHide && onHide()
  }, [setNotificate, onHide])

  useEffect(() => {
    if (hidingTimeout !== undefined) {
      setTimeout(() => {
        hideNotification()
      }, hidingTimeout)
    }
  }, [hidingTimeout, hideNotification])

  return ReactDOM.createPortal(
    notificate && (
      <Wrapper>
        <MessageWrapper type={type}>
          {hideCloseButton ? null : <CloseButton onClick={hideNotification} />}
          {type !== MessageType.default && <Icon type={type} />}
          <Text>{text}</Text>
        </MessageWrapper>
      </Wrapper>
    ),
    document.getElementById('portalContainer') as HTMLDivElement,
  )
}
