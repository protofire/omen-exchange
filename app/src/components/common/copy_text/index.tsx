import React, { HTMLAttributes, useState } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import styled from 'styled-components'
import { MessageType, Message } from '../message'

import CopySVG from './img/copy.svg'

const CopyWrapper = styled.button`
  background-color: transparent;
  background-position: 50% 50%;
  background-repeat: no-repeat;
  border: none;
  cursor: pointer;
  margin-left: 10px;
  outline: none;
  padding: 0;

  &:active {
    opacity: 0.5;
  }
`

interface Props extends HTMLAttributes<HTMLButtonElement> {
  toastMessage?: string
  value: string
}

export const CopyText: React.FC<Props> = (props: Props) => {
  const { toastMessage = 'Text copied to your clipboard!', value, ...restProps } = props
  const [showMessage, setShowMessage] = useState(false)

  const showCopyMessage = () => setShowMessage(true)
  const hideCopyMessage = () => setShowMessage(false)

  return (
    <>
      <CopyWrapper {...restProps}>
        <CopyToClipboard text={value}>
          <img onClick={showCopyMessage} src={CopySVG} alt="" />
        </CopyToClipboard>
      </CopyWrapper>
      {showMessage && (
        <Message
          hidingTimeout={5000}
          onHide={hideCopyMessage}
          text={toastMessage}
          type={MessageType.ok}
        />
      )}
    </>
  )
}
