import React, { HTMLAttributes } from 'react'

import styled from 'styled-components'
import ModalWrapper from '../modal_wrapper'
import { Well } from '../well'
import { TwitterIcon, TwitterShareButton } from 'react-share'

interface Props extends HTMLAttributes<HTMLDivElement> {
  title: string
  description: string
  shareUrl: string
  isOpen: boolean
  onClose: () => void
}


const OutcomeInfo = styled(Well)`
  margin-bottom: 30px;
`

const ButtonContainer = styled.div`
    float: right;
`

const TwitterGlobalButton = styled.button`
  color: white;
  background-color: #00aced;
  border: 0;
  border-radius: 3px;
  width: 92px;
  float: right;

  div {
    float: left;
  }
`

const Text = styled.p`
    margin: 8px 0px;
    float: right;
`

export const ModalTwitterShare = (props: Props) => {
  const { title, shareUrl, description, isOpen, onClose } = props

  return (
    <ModalWrapper isOpen={isOpen} onRequestClose={onClose} title={title}>
      <OutcomeInfo>
      {description}   
      </OutcomeInfo>

      <ButtonContainer>
        <TwitterGlobalButton>
          <TwitterShareButton url={shareUrl} title={description}>
            <TwitterIcon size={32} /> 
            <Text>Tweet</Text> 
          </TwitterShareButton>
        </TwitterGlobalButton>
      </ButtonContainer>
    </ModalWrapper>
  )
}
