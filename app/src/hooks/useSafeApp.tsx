import { SafeInfo } from '@gnosis.pm/safe-apps-sdk'
import SafeAppsSdkConnector from 'contract-proxy-kit/lib/esm/safeAppsSdkConnector'
import { useEffect, useState } from 'react'

const safeSdk = new SafeAppsSdkConnector()

export const useSafeApp = () => {
  const [safeInfo, setSafeInfo] = useState(safeSdk.safeAppInfo)

  useEffect(() => {
    if (!safeInfo) {
      safeSdk.appsSdk.addListeners({
        onSafeInfo: (safeInfo: SafeInfo) => setSafeInfo(safeInfo),
      })
    }
  }, [safeInfo])

  return safeInfo
}
