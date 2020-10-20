import { useEffect, useState } from 'react'

export const useRealityLink = (): 'https://reality.eth' | 'https://reality.eth.link' => {
  const [connected, setConnected] = useState<boolean>()
  const windowObj: any = window

  useEffect(() => {
    const fetchUserAccounts = async () => {
      const account = await windowObj.ethereum.request({ method: 'eth_accounts' })

      setConnected(account.length !== 0)

      windowObj.ethereum.on('accountsChanged', (accounts: string[]) => {
        setConnected(accounts.length !== 0)
      })
    }
    if (windowObj.ethereum) {
      fetchUserAccounts()
    }
  }, [windowObj.ethereum])

  return connected ? 'https://reality.eth' : 'https://reality.eth.link'
}
