import React from 'react'
import Modal from 'react-modal'
import { withTheme } from 'styled-components'

import ModalTitle from '../modal_title'

interface Props extends React.ComponentProps<typeof Modal> {
  children: React.ReactNode
  disableCloseButton?: boolean
  theme?: any
  title?: string
}

const ModalContainer: React.FC<Props> = props => {
  const { children, disableCloseButton, onRequestClose, theme, title, ...restProps } = props
  const { modalStyle } = theme

  React.useEffect(() => {
    Modal.setAppElement('#root')
  }, [])

  return (
    <Modal onRequestClose={onRequestClose} shouldCloseOnOverlayClick={true} style={modalStyle} {...restProps}>
      {title ? <ModalTitle disableCloseButton={disableCloseButton} onClick={onRequestClose} title={title} /> : null}
      {children}
    </Modal>
  )
}

export const ModalWrapper = withTheme(ModalContainer)
