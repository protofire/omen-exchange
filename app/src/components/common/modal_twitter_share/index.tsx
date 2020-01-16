import React, { HTMLAttributes } from 'react'

import ModalWrapper from '../modal_wrapper'
import { TwitterIcon, TwitterShareButton } from 'react-share'

interface Props extends HTMLAttributes<HTMLDivElement> {
  title: string
  description: string
  shareUrl: string
  isOpen: boolean
  onClose: () => void
}

export const ModalTwitterShare = (props: Props) => {
  const { title, shareUrl, description, isOpen, onClose } = props

  return (
    <ModalWrapper isOpen={isOpen} onRequestClose={onClose} title={title}>
      {description}
      <TwitterShareButton url={shareUrl} title={description}>
        <TwitterIcon size={32} />
      </TwitterShareButton>
    </ModalWrapper>
  )
}
