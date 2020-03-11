import React, { HTMLAttributes } from 'react'
import { TwitterIcon, TwitterShareButton } from 'react-share'
import styled from 'styled-components'

import { Well } from '../../common/well'
import { ModalWrapper } from '../../modal/modal_wrapper'

interface Props extends HTMLAttributes<HTMLDivElement> {
  description: string
  isOpen: boolean
  onClose: () => void
  shareUrl: string
  title: string
}

const OutcomeInfo = styled(Well)`
  margin-bottom: 30px;
`

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row-reverse;
`

const TwitterGlobalButton = styled.button`
  color: white;
  background-color: #00aced;
  border: 0;
  border-radius: 3px;
  width: 92px;
`
const TwitterShareButtonExt = styled(TwitterShareButton)`
  display: flex;
`

const Text = styled.p`
  margin: 8px 0px;
`

export const ModalTwitterShare = (props: Props) => {
  const { description, isOpen, onClose, shareUrl, title } = props

  return (
    <ModalWrapper isOpen={isOpen} onRequestClose={onClose} title={title}>
      <OutcomeInfo>{description}</OutcomeInfo>
      <ButtonContainer>
        <TwitterGlobalButton>
          <TwitterShareButtonExt title={description} url={shareUrl}>
            <TwitterIcon size={32} />
            <Text>Tweet</Text>
          </TwitterShareButtonExt>
        </TwitterGlobalButton>
      </ButtonContainer>
    </ModalWrapper>
  )
}
