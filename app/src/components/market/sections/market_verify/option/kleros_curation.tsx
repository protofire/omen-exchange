import { BigNumber, formatEther } from 'ethers/utils'
import humanizeDuration from 'humanize-duration'
import React, { ChangeEvent } from 'react'
import styled from 'styled-components'

import { MarketVerificationState } from '../../../../../util/types'
import { Button } from '../../../../button'
import { ButtonType } from '../../../../button/button_styling_types'
import { IconKleros } from '../../../../common/icons'
import Tick from '../img/tick.svg'

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

const GreenBold = styled.b`
  color: ${props => props.theme.colors.green};
`

const RightButton = styled(Button)`
  margin-left: auto;
`

interface StatefulRadioButton {
  selected?: boolean
}

interface Props {
  status: MarketVerificationState
  actionDeposit: string
  selection?: number
  listingCriteria: string
  challengePeriodDuration: number
  bounty: BigNumber
  selectSource: (e: ChangeEvent<HTMLInputElement>) => void
  ovmAddress: string // ovm === Omen Verified Markets, the name of the omen-kleros TCR.
  submissionTime: number
  itemID: string
}

export const KlerosCuration: React.FC<Props> = (props: Props) => {
  const {
    actionDeposit,
    bounty,
    challengePeriodDuration,
    itemID,
    listingCriteria,
    ovmAddress,
    selectSource,
    selection,
    status,
    submissionTime,
  } = props

  const deadline = submissionTime + challengePeriodDuration
  const deadlineUTC = '12 oct - 14h30 UTC'
  const timeRemaining = deadline - Date.now() / 1000

  let klerosDetails
  let KlerosNotice
  let KlerosRightColumn

  switch (status) {
    case MarketVerificationState.NotVerified: {
      klerosDetails = `Request verification with a ${formatEther(actionDeposit)} ETH security deposit.`
      KlerosNotice = (
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
      )
      KlerosRightColumn = (
        <>
          <RightColumn>
            <RadioWrapper selected={selection === 0}>
              <RadioTick alt="tick" selected={selection === 0} src={Tick} />
            </RadioWrapper>
          </RightColumn>
          <Input checked={selection === 0} onChange={selectSource} type="radio" value={0} />
        </>
      )
      break
    }
    case MarketVerificationState.Challengeable: {
      klerosDetails = `Challenge period pending`
      KlerosNotice = (
        <Description>
          Market invalid according to the{' '}
          <a href={listingCriteria} rel="noopener noreferrer" target="_blank">
            listing criteria
          </a>{' '}
          ? Collect <GreenBold>{formatEther(bounty)}</GreenBold> upon a successful challenge.
          <RightButton buttonType={ButtonType.secondary}>Challenge</RightButton>
        </Description>
      )
      KlerosRightColumn = (
        <div>
          <b>
            Ends in{' '}
            {humanizeDuration(timeRemaining, {
              delimiter: ' and ',
              largest: 2,
              round: true,
              units: ['y', 'mo', 'w', 'd', 'h', 'm'],
            })}
          </b>
          <span>{deadlineUTC}</span>
        </div>
      )
      break
    }
    case MarketVerificationState.WaitingArbitration: {
      klerosDetails = `Verification challenged`
      KlerosRightColumn = <a href={`curate.kleros.io/tcr/${ovmAddress}/${itemID}`}>Challenge details</a>
      break
    }
    case MarketVerificationState.Verified: {
      klerosDetails = `Verification successful`
      KlerosNotice = (
        <Description>
          Market invalid according to the{' '}
          <a href={listingCriteria} rel="noopener noreferrer" target="_blank">
            listing criteria
          </a>{' '}
          ?<RightButton buttonType={ButtonType.secondary}>Remove Market</RightButton>
        </Description>
      )
      KlerosRightColumn = <GreenBold>verified</GreenBold>
      break
    }
    default:
      throw new Error('Invalid market state')
  }

  return (
    <Row key="Kleros">
      <SubRow>
        <LeftColumn>
          <LogoWrapper>
            <IconKleros />
          </LogoWrapper>
        </LeftColumn>
        <CenterColumn>
          <Option>Kleros</Option>
          <OptionDetails>{klerosDetails}</OptionDetails>
        </CenterColumn>
        {KlerosRightColumn}
      </SubRow>
      <SubRow>{KlerosNotice}</SubRow>
    </Row>
  )
}
