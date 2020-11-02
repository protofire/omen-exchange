import { useEffect, useState } from 'react'

export const useRealityLink = (): 'https://reality.eth' | 'https://reality.eth.link' => {
  const [connected, setConnected] = useState<boolean>()
  const windowObj: any = window

  useEffect(() => {
    const fetchUserAccounts = async () => {
      const account = await windowObj.ethereum.request({ method: 'eth_accounts' })
      const chainId = windowObj.ethereum.chainId

      setConnected(account.length !== 0 && chainId === '0x1')

      windowObj.ethereum.on('accountsChanged', (accountsEvent: string[]) => {
        setConnected(accountsEvent.length !== 0)
      })
      windowObj.ethereum.on('chainChanged', (chaindIdEvent: string) => {
        setConnected(account.length !== 0 && chaindIdEvent === '0x4')
      })
    }
    if (windowObj.ethereum) {
      fetchUserAccounts()
    }
  }, [windowObj.ethereum])

  return connected ? 'https://reality.eth' : 'https://reality.eth.link'
}
