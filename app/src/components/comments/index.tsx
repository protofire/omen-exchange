import React, { useEffect, useRef, useState } from 'react'

import { IS_CORONA_VERSION } from '../../common/constants'

import { DisqusComments } from './disqus_comments'

interface Props {
  marketMakerAddress: string
}

export const Comments: React.FC<Props> = ({ marketMakerAddress }) => {
  const ThreeBoxCommentsRef = useRef<any>()
  const [show3box, setShow3Box] = useState(false)

  useEffect(() => {
    if (!IS_CORONA_VERSION) {
      import('./three_box_comments').then(ThreeBoxCommentsModule => {
        ThreeBoxCommentsRef.current = ThreeBoxCommentsModule.ThreeBoxComments
        setShow3Box(true)
      })
    }
  }, [])

  if (IS_CORONA_VERSION) {
    return <DisqusComments marketMakerAddress={marketMakerAddress} />
  }

  if (!ThreeBoxCommentsRef.current || !show3box) {
    return null
  }

  return <ThreeBoxCommentsRef.current threadName={marketMakerAddress} />
}
