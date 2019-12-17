import React, { useEffect, useState } from 'react'
import Box from '3box'
import ThreeBoxCommentsReact from '3box-comments-react'
import styled from 'styled-components'
import { ConnectedWeb3Context, useConnectedWeb3Context } from '../../../hooks/connectedWeb3'
import { THREEBOX_ADMIN_ADDRESS, THREEBOX_SPACE_NAME } from '../../../common/constants'
import { getLogger } from '../../../util/logger'
import { ButtonCSS } from '../../../common/styling_types'

const logger = getLogger('Component::ThreeBoxComments')

const ThreeBoxCustom = styled.div`
  border-top: 1px solid ${props => props.theme.borders.borderColor};
  margin: 40px 0 0 0;
  padding: 20px 0 0;

  > .threebox-comments-react {
    max-width: 100%;
    padding: 0;

    /* Main comment area */
    .input {
      img {
        height: 40px;
        max-height: 40px;
        max-width: 40px;
        min-height: 40px;
        min-width: 40px;
        width: 40px;
      }

      .input_form {
        color: #000;
        font-size: 13px;
        font-weight: normal;
        height: 54px;
        line-height: 1.2;
        min-height: 54px;
        padding: 5px 12px 5px 60px;
      }

      .input_commentAs {
        color: #999;
        left: auto;
        right: 0;
      }
    }

    /* Comments list */
    .dialogue {
      /* Comment */
      .comment {
        img {
          height: 30px;
          max-height: 30px;
          max-width: 30px;
          min-height: 30px;
          min-width: 30px;
          width: 30px;
        }
        .comment_content_context_main_user_info {
          margin-bottom: 0;
        }
        .comment_content_context_main_user_info_username {
          color: #000;
          font-size: 15px;
          font-weight: 500;
          line-height: 1.2;
        }
        .comment_content_context {
          margin: 0;
        }
        .comment_content_context_time {
          color: #999;
          font-size: 11px;
          line-height: 1.2;
          margin-bottom: 5px;
        }
        .comment_content_text {
          color: #333;
          font-size: 13px;
          font-weight: normal;
          line-height: 1.45;
          margin: 0;
          text-align: left;
        }
      }
    }
    .context {
      height: auto;
      justify-content: flex-end;
      margin: 0;

      .context_text {
        color: #999;
        font-size: 12px;
        font-weight: 400;
        line-height: 1.2;
      }
    }
    .dialogue_button_container {
      height: auto;

      .dialogue_button {
        ${ButtonCSS}
        width: 100%;
      }
    }
  }

  footer {
    margin-bottom: 0;
    padding-top: 20px;

    .footer_text {
      color: #999;
      font-size: 12px;
      font-weight: 400;
    }
  }
`

const CommentsTitle = styled.h3`
  color: #000;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.2;
  margin: 0 0 15px;
`

interface Props {
  threadName: string
}

export const ThreeBoxComments = (props: Props) => {
  const context: ConnectedWeb3Context = useConnectedWeb3Context()
  const { threadName } = props

  const [box, setBox] = useState<any>(null)
  // TODO: fix with useConnectedWeb3Wallet context
  const [currentUserAddress, setCurrentUserAddress] = useState<string>(context.account || '')

  useEffect(() => {
    let isSubscribed = true

    const handle3boxLogin = async () => {
      const { library } = context
      // TODO: fix with useConnectedWeb3Wallet context
      const account = context.account || ''

      logger.log(`Open three box with account ${account}`)

      const newBox = await Box.openBox(account, library._web3Provider)

      const spaceData = await Box.getSpace(account, THREEBOX_SPACE_NAME)
      if (Object.keys(spaceData).length === 0) {
        await newBox.openSpace(THREEBOX_SPACE_NAME)
      }
      if (isSubscribed) setCurrentUserAddress(account)

      newBox.onSyncDone(() => {
        if (isSubscribed) setBox(newBox)
        logger.log(`Three box sync with account ${account}`)
      })
    }

    handle3boxLogin()

    return () => {
      isSubscribed = false
    }
  }, [context])

  return (
    <ThreeBoxCustom>
      <CommentsTitle>Comments</CommentsTitle>
      <ThreeBoxCommentsReact
        adminEthAddr={THREEBOX_ADMIN_ADDRESS}
        box={box}
        currentUserAddr={currentUserAddress}
        showCommentCount={10}
        spaceName={THREEBOX_SPACE_NAME}
        threadName={threadName}
        useHovers={true}
      />
    </ThreeBoxCustom>
  )
}
