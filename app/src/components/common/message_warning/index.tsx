import React from 'react'

import { Message, MessageType } from '../message'

interface MessageWarningProps {
  text: string
}

export const MessageWarning = (props: MessageWarningProps) => {
  const { text } = props

  return <Message text={text} type={MessageType.warning} />
}
