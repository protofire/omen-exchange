import React from 'react'

interface Props {
  currentNetwork: string | 0 | undefined
}

export const SwitchNetworkModal: React.FC<Props> = props => {
  const { currentNetwork } = props

  return <p>wrong ;network</p>
}
