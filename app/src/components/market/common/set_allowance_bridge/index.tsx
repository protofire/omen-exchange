import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React, { useMemo, useState } from 'react'
import styled from 'styled-components'

import { DEFAULT_TOKEN_ADDRESS, DEFAULT_TOKEN_ADDRESS_RINKEBY } from '../../../../common/constants'
import { useConnectedCPKContext, useConnectedWeb3Context, useCpkAllowance } from '../../../../hooks'
import { RemoteData } from '../../../../util/remote_data'
import { Ternary } from '../../../../util/types'
import { ButtonStateful, ButtonStates } from '../../../button/button_stateful'

const SetAllowanceButton = styled(ButtonStateful)`
  margin-top: 20px;
  width: 100% !important;
`

interface Props {
  selectedAmount: BigNumber
}

export const SetAllowance: React.FC<Props> = props => {
  const { library: provider, networkId } = useConnectedWeb3Context()
  const [allowanceFinished, setAllowanceFinished] = useState(false)

  const cpk = useConnectedCPKContext()
  const signer = useMemo(() => provider.getSigner(), [provider])

  const unlockCollateral = async () => {
    if (!cpk) {
      return
    }

    await unlock()
    setAllowanceFinished(true)
  }

  const daiAddress =
    networkId === 1
      ? DEFAULT_TOKEN_ADDRESS
      : networkId === 99
      ? DEFAULT_TOKEN_ADDRESS_RINKEBY
      : '0x2E4adeCb3330d72bC01F5acE920093a651f99E44'
  const { allowance, unlock } = useCpkAllowance(signer, daiAddress)
  const isFinished = allowanceFinished && RemoteData.is.success(allowance)
  const isLoading = RemoteData.is.asking(allowance)
  const state = isLoading ? ButtonStates.working : isFinished ? ButtonStates.finished : ButtonStates.idle
  const hasEnoughAllowance = RemoteData.mapToTernary(allowance, allowance =>
    allowance.gte(props.selectedAmount || Zero),
  )
  const hasZeroAllowance = RemoteData.mapToTernary(allowance, allowance => allowance.isZero())
  const showSetAllowance =
    !cpk?.cpk.isSafeApp() &&
    (allowanceFinished || hasZeroAllowance === Ternary.True || hasEnoughAllowance === Ternary.False)

  return (
    <>
      {showSetAllowance && (
        <SetAllowanceButton disabled={isLoading || isFinished} onClick={unlockCollateral} state={state}>
          Set Allowance
        </SetAllowanceButton>
      )}
    </>
  )
}
