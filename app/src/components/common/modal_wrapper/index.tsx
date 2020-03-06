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

const ModalWrapper: React.FC<Props> = props => {
  const { children, disableCloseButton, onRequestClose, theme, title, ...restProps } = props
  const { modalStyle } = theme

  React.useEffect(() => {
    Modal.setAppElement('#root')
  }, [])

  return (
    <Modal {...restProps} onRequestClose={onRequestClose} shouldCloseOnOverlayClick={true} style={modalStyle}>
      {title ? <ModalTitle disableCloseButton={disableCloseButton} onClick={onRequestClose} title={title} /> : null}
      {children}
    </Modal>
  )
}

export default withTheme(ModalWrapper)
