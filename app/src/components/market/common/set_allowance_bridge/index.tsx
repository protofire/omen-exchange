import React, { useMemo } from 'react'
import styled from 'styled-components'

import { useConnectedCPKContext, useConnectedWeb3Context, useCpkAllowance } from '../../../../hooks'
import { ButtonStateful } from '../../../button/button_stateful'

const SetAllowanceButton = styled(ButtonStateful)`
  margin-top: 20px;
  width: 100% !important;
  font-weight: 500;
`

export const SetAllowance: React.FC<> = () => {
  const { library: provider, networkId } = useConnectedWeb3Context()
  const cpk = useConnectedCPKContext()
  const signer = useMemo(() => provider.getSigner(), [provider])
  //  const daiAddress=networkId===1?
  // const { allowance, unlock } = useCpkAllowance(signer, collateral.address)
  return (
    <SetAllowanceButton
      onClick={() => {
        console.log('jere')
      }}
      state={0}
    >
      Set Allowance
    </SetAllowanceButton>
  )
}
