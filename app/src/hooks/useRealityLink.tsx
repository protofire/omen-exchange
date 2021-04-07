import { useEffect, useState } from 'react'

export const useRealityLink = (relay?: boolean): string => {
  const [connected, setConnected] = useState<boolean>()
  const [chainId, setChainId] = useState<Maybe<string>>(null)
  const windowObj: any = window

  useEffect(() => {
    const fetchUserAccounts = async () => {
      const account = await windowObj.ethereum.request({ method: 'eth_accounts' })
      setChainId(windowObj.ethereum.chainId)

      setConnected(account.length !== 0 && chainId === '0x1')

      windowObj.ethereum.on('accountsChanged', (accountsEvent: string[]) => {
        setConnected(accountsEvent.length !== 0)
      })
      windowObj.ethereum.on('chainChanged', (chaindIdEvent: string) => {
        setConnected(account.length !== 0 && chaindIdEvent === '0x1')
      })
    }
    if (windowObj.ethereum) {
      fetchUserAccounts()
    }
  }, [windowObj.ethereum, chainId])

  let realityLink
  if (chainId === '0x64' || chainId === '0x4d' || relay) {
    realityLink = 'https://realitio.github.io'
  } else if (connected) {
    realityLink = 'https://reality.eth/app'
  } else {
    realityLink = 'https://reality.eth.link/app'
  }

  return realityLink
}
