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

  const [selection, setSelection] = useState<number | undefined>()
  const { kleros } = useContracts(context)
  const [submissionDeposit, setSubmissionDeposit] = useState<string>('0')
  const [submissionBaseDeposit, setSubmissionBaseDeposit] = useState<string>('0')
  const [removalBaseDeposit, setRemovalBaseDeposit] = useState<string>('0')
  const [listingCriteria, setListingCriteria] = useState<string>('')
  const [challengePeriodDuration, setChallengePeriodDuration] = useState<number>(0)
  const [klerosVerificationData, setKlerosVerificationData] = useState<{
    verificationState?: MarketVerificationState
    submissionTime?: number | undefined
    itemID?: string | undefined
  }>({})

  useEffect(() => {
    ;(async () => {
      const marketVerificationData = await kleros.getMarketState(marketMakerData)
      setKlerosVerificationData(marketVerificationData)
      const [
        listingCriteriaURL,
        submissionDeposit,
        challengePeriodDuration,
        submissionBaseDeposit,
        removalBaseDeposit,
      ] = await Promise.all([
        await kleros.getListingCriteriaURL(),
        await kleros.getSubmissionDeposit(),
        await kleros.getChallengePeriodDuration(),
        await kleros.getSubmissionBaseDeposit(),
        await kleros.getRemovalBaseDeposit(),
      ])
      setListingCriteria(listingCriteriaURL)
      setSubmissionDeposit(submissionDeposit.toString())
      setChallengePeriodDuration(challengePeriodDuration.toNumber())
      setSubmissionBaseDeposit(submissionBaseDeposit.toString())
      setRemovalBaseDeposit(removalBaseDeposit.toString())
    })()
  }, [kleros, marketMakerData, submissionIDs])

  const selectSource = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget
    setSelection(Number(value))
  }, [])

  if (!listingCriteria) return <InlineLoading />

  return (
    <>
      <SubsectionTitleWrapper>
        <SubsectionTitle>Verify</SubsectionTitle>
      </SubsectionTitleWrapper>
      <KlerosCuration
        challengePeriodDuration={challengePeriodDuration}
        itemID={klerosVerificationData.itemID}
        listingCriteria={listingCriteria}
        ovmAddress={kleros.omenVerifiedMarkets.address}
        removalBaseDeposit={removalBaseDeposit}
        selectSource={selectSource}
        selection={selection}
        status={klerosVerificationData.verificationState}
        submissionBaseDeposit={submissionBaseDeposit}
        submissionDeposit={submissionDeposit}
        submissionTime={klerosVerificationData.submissionTime}
      />
      <DxDaoCuration selectSource={selectSource} selection={selection} />
      <BottomRow>
        <RightButton buttonType={ButtonType.primaryLine} disabled={typeof selection !== 'number'}>
          Request Verification
        </RightButton>
      </BottomRow>
    </>
  )
}

export const MarketVerify = withRouter(MarketVerifyWrapper)
