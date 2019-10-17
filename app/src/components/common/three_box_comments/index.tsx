import React, { useMemo, useState } from 'react'
import Box from '3box'
import ThreeBoxCommentsReact from '3box-comments-react'

import { ConnectedWeb3Context, useConnectedWeb3Context } from '../../../hooks/connectedWeb3'
import { THREEBOX_ADMIN_ADDRESS, THREEBOX_SPACE_NAME } from '../../../common/constants'
import { getLogger } from '../../../util/logger'

const logger = getLogger('Component::ThreeBoxComments')

export const ThreeBoxComments = () => {
  const context: ConnectedWeb3Context = useConnectedWeb3Context()

  const [box, setBox] = useState<any>(null)
  const [currentUserAddress, setCurrentUserAddress] = useState<string>(context.account)

  const handle3boxLogin = async () => {
    const { account, library } = context
    logger.log(`Open three box with account ${account}`)

    const newBox = await Box.openBox(account, library._web3Provider)
    await newBox.openSpace(THREEBOX_SPACE_NAME)
    setCurrentUserAddress(account)

    newBox.onSyncDone(() => {
      setBox(newBox)
      logger.log(`Three box sync with account ${account}`)
    })
  }

  useMemo(() => handle3boxLogin(), [context])

  return (
    <ThreeBoxCommentsReact
      spaceName={THREEBOX_SPACE_NAME}
      threadName="profile"
      adminEthAddr={THREEBOX_ADMIN_ADDRESS}
      box={box}
      currentUserAddr={currentUserAddress}
      showCommentCount={10}
      useHovers={false}
    />
  )
}
