import React, { HTMLAttributes } from 'react'
import Modal from 'react-modal'
import styled, { withTheme } from 'styled-components'

interface Props extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  theme?: any
}

export const ModalYourConnection = (props: Props) => {
  const { isOpen, theme } = props

  React.useEffect(() => {
    Modal.setAppElement('#root')
  }, [])

  return <Modal isOpen={isOpen} style={theme.connectionModal}></Modal>
}

export const ModalYourConnectionWrapper = withTheme(ModalYourConnection)
