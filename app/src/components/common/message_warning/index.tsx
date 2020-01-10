import React, { useState } from 'react'
import { Message } from '../message'

interface MessageWarningProps {
  message: string
}

export const MessageWarning = (props: MessageWarningProps) => {
  const [displayMessage, setDisplayMessage] = useState(true)
  const { message } = props
  return (
    <>
      {displayMessage && (
        <Message
          type="warning"
          delay={3000}
          message={message}
          onClick={() => setDisplayMessage(false)}
        />
      )}
    </>
  )
}
