import { formatEther } from 'ethers/utils'
import humanizeDuration from 'humanize-duration'
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { ConnectedWeb3Context, useContracts } from '../../../../hooks'
import { KlerosMarketState } from '../../../../services/kleros'
import { getLogger } from '../../../../util/logger'
import { MarketMakerData } from '../../../../util/types'
import { Button } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import { SubsectionTitle, SubsectionTitleWrapper } from '../../../common'
import { IconDxDao, IconKleros } from '../../../common/icons'

import Tick from './img/tick.svg'

const Row = styled.div`
  border-top: 1px solid ${props => props.theme.borders.borderColorLighter};
  margin: 0 -25px;
  padding: 20px 25px;
  position: relative;
`
const SubRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: no-wrap;
  justify-content: space-between;
  position: relative;
`

const BottomRow = styled.div`
  border-top: 1px solid ${props => props.theme.borders.borderColorLighter};
  margin: 0 -25px;
  padding: 20px 25px 0;
`

const LeftColumn = styled.div``

const CenterColumn = styled.div`
  width: 75%;
`

const RightColumn = styled.div``

const LogoWrapper = styled.div`
  border-radius: 50%;
  border: 1px solid ${props => props.theme.colors.tertiary};
  width: 38px;
  height: 38px;
  display: flex;
  justify-content: center;
  align-items: center;
`

const RadioWrapper = styled.div<StatefulRadioButton>`
  border-radius: 50%;
  border: 1px solid ${props => props.theme.colors.tertiary};
  width: 38px;
  height: 38px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.selected && props.theme.colors.clickable};
`

const RadioTick = styled.img<StatefulRadioButton>`
  filter: ${props => (props.selected ? 'saturate(0) brightness(2)' : 'saturate(0) brightness(1.6)')};

  ${SubRow}:hover & {
    filter: ${props => !props.selected && 'none'};
  }
`

const Option = styled.div`
  color: ${props => props.theme.colors.textColorDarker};
  font-weight: 500;
`

const OptionDetails = styled.div`
  color: ${props => props.theme.colors.textColorLighter};
`

const RightButton = styled(Button)`
  margin-left: auto;
`

const Description = styled.p`
  align-items: center;
  border-radius: 4px;
  border: 1px solid ${props => props.theme.borders.borderColorLighter};
  display: flex;
  padding: 21px 25px;
  color: ${props => props.theme.colors.textColorLightish};
  font-size: 14px;
  letter-spacing: 0.2px;
  line-height: 1.4;
  margin: 25px 0;
  display: inline-block;
`

const Input = styled.input`
  cursor: pointer;
  height: 100%;
  left: 0;
  opacity: 0;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 5;
  border: 1px solid red;
`

interface StatefulRadioButton {
  selected?: boolean
}

interface FetchState {
  startFetch: boolean
  result: string
}

interface Props extends RouteComponentProps<any> {
  marketMakerData: MarketMakerData
  context: ConnectedWeb3Context
}

const logger = getLogger('Market::Verify')

const MarketVerifyWrapper: React.FC<Props> = (props: Props) => {
  const { context, marketMakerData } = props || {}
  const { submissionIDs } = marketMakerData || {}

  const [selection, setSelection] = useState<number>(0)
  const { kleros } = useContracts(context)
  const [actionDeposit, setActionDeposit] = useState<string>('0')
  const [listingCriteria, setListingCriteria] = useState<string>('')
  const [challengePeriodDuration, setChallengePeriodDuration] = useState<number>(0)
  const [fetchState, setFetchState] = useState<FetchState>({ startFetch: false, result: '' })

  useEffect(() => {
    ;(async () => {
      const klerosMarketState = await kleros.getMarketState(marketMakerData)

      if (klerosMarketState === KlerosMarketState.Submittable && !fetchState.startFetch) {
        setFetchState(prevState => ({ ...prevState, startFetch: true }))
        try {
          const [listingCriteriaURL, submissionDeposit, challengePeriodDuration] = await Promise.all([
            await kleros.getListingCriteriaURL(),
            await kleros.getSubmissionDeposit(),
            await kleros.getChallengePeriodDuration(),
          ])

          setListingCriteria(listingCriteriaURL)
          setActionDeposit(submissionDeposit.toString())
          setChallengePeriodDuration(challengePeriodDuration.toNumber())
          setFetchState(prevState => ({ ...prevState, result: 'success' }))
        } catch (error) {
          setFetchState(prevState => ({ ...prevState, result: 'error' }))
        }
      }
    })()
  }, [fetchState.startFetch, kleros, marketMakerData, submissionIDs])

  const curationSources = [
    {
      option: 'Kleros',
      details: `Request verification with a ${formatEther(actionDeposit)} ETH security deposit.`,
      icon: <IconKleros />,
      notice: (
        <Description>
          Make sure your submission complies with the{' '}
          <a href={listingCriteria} rel="noopener noreferrer" target="_blank">
            listing criteria
          </a>{' '}
          to avoid challenges. The <b>{formatEther(actionDeposit)}</b> ETH security deposit will be reimbursed if your
          submission is accepted. The challenge period lasts{' '}
          <b>
            {humanizeDuration(challengePeriodDuration * 1000, {
              delimiter: ' and ',
              largest: 2,
              round: true,
              units: ['y', 'mo', 'w', 'd', 'h', 'm'],
            })}
          </b>
          .
        </Description>
      ),
    },
    {
      option: 'Dxdao Curation',
      details: 'Request Verification',
      icon: <IconDxDao />,
    },
  ]

  const selectSource = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget
    setSelection(Number(value))
  }, [])

  if (fetchState.result !== 'success') return null

  return (
    <>
      <SubsectionTitleWrapper>
        <SubsectionTitle>Verify</SubsectionTitle>
      </SubsectionTitleWrapper>
      {curationSources.map(({ details, icon: Icon, notice: Notice, option }, index) => (
        <Row key={option}>
          <SubRow>
            <LeftColumn>
              <LogoWrapper>{Icon}</LogoWrapper>
            </LeftColumn>
            <CenterColumn>
              <Option>{option}</Option>
              <OptionDetails>{details}</OptionDetails>
            </CenterColumn>
            <RightColumn>
              <RadioWrapper selected={selection === index}>
                <RadioTick alt="tick" selected={selection === index} src={Tick} />
              </RadioWrapper>
            </RightColumn>
            <Input checked={selection === index} name={option} onChange={selectSource} type="radio" value={index} />
          </SubRow>
          <SubRow>{Notice && <div>{Notice}</div>}</SubRow>
        </Row>
      ))}
      <BottomRow>
        <RightButton buttonType={ButtonType.primary} disabled={typeof selection !== 'number'}>
          Request Verification
        </RightButton>
      </BottomRow>
    </>
  )
}

export const MarketVerify = withRouter(MarketVerifyWrapper)
