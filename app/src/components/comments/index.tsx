import React, { useEffect, useRef, useState } from 'react'

interface Props {
  marketMakerAddress: string
}

export const Comments: React.FC<Props> = ({ marketMakerAddress }) => {
  const ThreeBoxCommentsRef = useRef<any>()
  const [show3box, setShow3Box] = useState(false)

  useEffect(() => {
    import('./three_box_comments').then(ThreeBoxCommentsModule => {
      ThreeBoxCommentsRef.current = ThreeBoxCommentsModule.ThreeBoxComments
      setShow3Box(true)
    })
  }, [])

  if (!ThreeBoxCommentsRef.current || !show3box) {
    return null
  }

  return <ThreeBoxCommentsRef.current threadName={marketMakerAddress} />
}
