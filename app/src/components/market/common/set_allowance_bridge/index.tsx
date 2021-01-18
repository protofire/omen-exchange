import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React, { useMemo, useState } from 'react'
import styled from 'styled-components'

import { DEFAULT_TOKEN_ADDRESS } from '../../../../common/constants'
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

  const { allowance, unlock } = useCpkAllowance(signer, DEFAULT_TOKEN_ADDRESS)
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
