import { useEffect, useState } from 'react'

export const useDetectAdblocker = (): boolean => {
  const [isAdBlockDetected, setIsAdBlockDetected] = useState(false)

  useEffect(() => {
    const detectAdblock = async () => {
      // Creates a bait for ad block
      const elem = document.createElement('div')

      elem.className = 'adclass'
      document.body.appendChild(elem)

      const isAdBlockDetected = await !(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length)

      setIsAdBlockDetected(isAdBlockDetected)
    }

    detectAdblock()
  }, [])

  return isAdBlockDetected
}
