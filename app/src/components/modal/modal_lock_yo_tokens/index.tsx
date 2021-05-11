import React from 'react'
import Modal from 'react-modal'
import styled, { css } from 'styled-components'
interface Props {
  isOpen: boolean
}

export const ModalLockYoTokens = (props: Props) => {
  const { isOpen } = props
  const milan = 'stringica'
  return <Modal isOpen={isOpen}>{milan} Nikola</Modal>
}
