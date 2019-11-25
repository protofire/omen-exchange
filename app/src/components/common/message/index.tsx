import React, { ReactPortal, useState } from 'react'
import ReactDOM from 'react-dom'
import styled, { css } from 'styled-components'

import WarningSVG from './img/warning.svg'
import InfoSVG from './img/info.svg'

const WarningIcon = styled.div`
  background-image: url(${WarningSVG});
  width: 25px;
  height: 25px;
  object-fit: contain;
  position: fixed;
  left: 15px;
  top: 13px;
`

const InfoIcon = styled.div`
  background-image: url(${InfoSVG});
  width: 25px;
  height: 21.9px;
  object-fit: contain;
  position: fixed;
  left: 15px;
  top: 13px;
`

const MessageWrapperCss = css`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 322px;
  height: 53px;
  border-radius: 5px;
  box-shadow: 0 0 18px 0 rgba(0, 0, 0, 0.08);
  background-color: #ffffff;
  position: fixed;
  left: 50%;
  transform: translate(-50%, 0);
  top: 79px;
  z-index: 12345;
`

const OkMessageWrapper = styled.div`
  ${MessageWrapperCss}
  border: solid 1px #00be95;
`

const InfoMessageWrapper = styled.div`
  ${MessageWrapperCss}
  border: solid 1px #b7b7b7;
`

const WarningMessageWrapper = styled.div`
  ${MessageWrapperCss}
  border: solid 1px #ff7848;
`

const MessageBlockCss = css`
  width: 300px;
  height: 42px;
  font-family: Roboto;
  font-size: 13px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.38;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
`

const MessageBlockInfo = styled.p`
  ${MessageBlockCss}
  padding: 4px 11px 17px 44px;
`

const MessageBlockWarning = styled.p`
  ${MessageBlockCss}
  padding: 4px 4px 9px 44px;
`

const MessageBlockOk = styled.p`
  ${MessageBlockCss}
  padding: 4px 11px 4px 11px;
`

type MessageType = 'info' | 'warning' | 'ok'

interface Props {
  delay?: number
  message: string
  type: MessageType
}

export const Message: React.FC<Props> = (props: Props): ReactPortal => {
  const { message, type, delay = 1000 } = props
  const portal: any = document.getElementById('portalContainer')

  const [showNotification, setShowNotification] = useState(false)

  setTimeout(() => setShowNotification(true), delay)

  const Message = () => {
    switch (type) {
      case 'info':
        return (
          <InfoMessageWrapper>
            <InfoIcon />
            <MessageBlockInfo>{message}</MessageBlockInfo>
          </InfoMessageWrapper>
        )
      case 'warning':
        return (
          <WarningMessageWrapper>
            <WarningIcon />
            <MessageBlockWarning>{message}</MessageBlockWarning>
          </WarningMessageWrapper>
        )
      case 'ok':
        return (
          <OkMessageWrapper>
            <MessageBlockOk>{message}</MessageBlockOk>
          </OkMessageWrapper>
        )
    }
  }

  const messageToRender = <>{showNotification && <Message />}</>

  return ReactDOM.createPortal(messageToRender, portal)
}
