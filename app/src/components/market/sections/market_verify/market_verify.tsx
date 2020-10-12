import { BigNumber } from 'ethers/utils'
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { ConnectedWeb3Context, useContracts } from '../../../../hooks'
import { MarketMakerData, MarketVerificationState } from '../../../../util/types'
import { Button } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import { SubsectionTitle, SubsectionTitleWrapper } from '../../../common'
import { InlineLoading } from '../../../loading'

import { DxDaoCuration } from './option/dxdao_curation'
import { KlerosCuration } from './option/kleros_curation'

const BottomRow = styled.div`
  border-top: 1px solid ${props => props.theme.borders.borderColorLighter};
  margin: 0 -25px;
  padding: 20px 25px 0;
`

const RightButton = styled(Button)`
  margin-left: auto;
`

interface Props extends RouteComponentProps<any> {
  marketMakerData: MarketMakerData
  context: ConnectedWeb3Context
}

const MarketVerifyWrapper: React.FC<Props> = (props: Props) => {
  const { context, marketMakerData } = props || {}
  const { submissionIDs } = marketMakerData || {}

  const [selection, setSelection] = useState<number>(0)
  const { kleros } = useContracts(context)
  const [actionDeposit, setActionDeposit] = useState<string>('0')
  const [listingCriteria, setListingCriteria] = useState<string>('')
  const [challengePeriodDuration, setChallengePeriodDuration] = useState<number>(0)
  const [klerosVerificationState, setKlerosVerificationState] = useState<any>()

  useEffect(() => {
    ;(async () => {
      setKlerosVerificationState(await kleros.getMarketState(marketMakerData))

      const [listingCriteriaURL, submissionDeposit, challengePeriodDuration] = await Promise.all([
        await kleros.getListingCriteriaURL(),
        await kleros.getSubmissionDeposit(),
        await kleros.getChallengePeriodDuration(),
      ])

      setListingCriteria(listingCriteriaURL)
      setActionDeposit(submissionDeposit.toString())
      setChallengePeriodDuration(challengePeriodDuration.toNumber())
    })()
  }, [kleros, marketMakerData, submissionIDs])

  const selectSource = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget
    setSelection(Number(value))
  }, [])

  if (!listingCriteria || !klerosVerificationState === undefined) return <InlineLoading />

  return (
    <>
      <SubsectionTitleWrapper>
        <SubsectionTitle>Verify</SubsectionTitle>
      </SubsectionTitleWrapper>
      <KlerosCuration // TODO: Replace placeholders.
        actionDeposit={actionDeposit}
        bounty={new BigNumber(0)}
        challengePeriodDuration={challengePeriodDuration}
        itemID="0xabc123..."
        listingCriteria={listingCriteria}
        ovmAddress={'0xb7z...'}
        selectSource={selectSource}
        selection={selection}
        status={klerosVerificationState} // ovm === Omen Verified Markets, the name of the omen-kleros TCR.
        submissionTime={16155616}
      />
      <DxDaoCuration selectSource={selectSource} selection={selection} />
      <BottomRow>
        <RightButton buttonType={ButtonType.primary} disabled={typeof selection !== 'number'}>
          Request Verification
        </RightButton>
      </BottomRow>
    </>
  )
}

export const MarketVerify = withRouter(MarketVerifyWrapper)
