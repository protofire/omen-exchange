import React, { DOMAttributes } from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { TwitterIcon, TwitterShareButton } from 'react-share'
import styled from 'styled-components'

import { Status } from '../../../util/types'
import { Button } from '../../button'
import { ButtonType } from '../../button/button_styling_types'
import { ModalWrapper } from '../modal_wrapper'

const Text = styled.p`
  align-items: center;
  color: #86909e;
  display: flex;
  font-size: 17px;
  font-weight: 500;
  justify-content: center;
  letter-spacing: 0.4px;
  line-height: 1.5;
  margin: 30px 0;
  min-height: 85px;
  text-align: center;
`

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`

const TwitterShareButtonExt = styled(TwitterShareButton)`
  display: flex;
`

const ButtonTwitter = styled(Button)`
  background-color: #00aced;
  border: none;
  color: #fff;
  flex-grow: 1;

  rect {
    fill: none;
  }

  &:hover {
    background-color: #009eda;
    color: #fff;
  }
`

const ButtonText = styled.p`
  margin: 0 0 0 8px;
`

const ButtonStyled = styled(Button)`
  flex-grow: 1;
`

interface Props extends DOMAttributes<HTMLDivElement>, RouteComponentProps {
  goBackToAddress?: string
  isOpen: boolean
  onClose: () => void
  shareUrl?: string
  status?: Status
  text: string
  title: string
  tweet?: string
}

const Modal: React.FC<Props> = props => {
  const { status = Status.Ready, isOpen, onClose, shareUrl, title, tweet, text, history, goBackToAddress = '' } = props
  const onRequestClose = goBackToAddress ? () => history.push(goBackToAddress) : onClose
  const shareOnTwitter = status !== Status.Error && tweet && shareUrl

  return (
    <ModalWrapper isOpen={isOpen} onRequestClose={onRequestClose} title={title}>
      <Text>{text}</Text>
      <ButtonContainer>
        {shareOnTwitter && (
          <TwitterShareButtonExt style={{ flexGrow: '1' }} title={tweet} url={shareUrl}>
            <ButtonTwitter>
              <TwitterIcon size={32} />
              <ButtonText>Share on Twitter</ButtonText>
            </ButtonTwitter>
          </TwitterShareButtonExt>
        )}
        {status === Status.Error && (
          <ButtonStyled buttonType={ButtonType.primary} onClick={onClose}>
            Try Again?
          </ButtonStyled>
        )}
        {!shareOnTwitter && status !== Status.Error && (
          <ButtonStyled buttonType={ButtonType.primary} onClick={onRequestClose}>
            OK
          </ButtonStyled>
        )}
      </ButtonContainer>
    </ModalWrapper>
  )
}

export const ModalTransactionResult = withRouter(Modal)
