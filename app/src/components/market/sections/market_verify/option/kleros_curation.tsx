import { formatEther } from 'ethers/utils'
import humanizeDuration from 'humanize-duration'
import moment from 'moment-timezone'
import React, { ChangeEvent } from 'react'
import styled from 'styled-components'

import { KlerosCurationData, MarketVerificationState } from '../../../../../util/types'
import { Button } from '../../../../button'
import { ButtonType } from '../../../../button/button_styling_types'
import { IconExclamation, IconKleros } from '../../../../common/icons'
import Tick from '../img/tick.svg'
import {
  CurationCenterColumn,
  CurationLeftColumn,
  CurationOption,
  CurationOptionDetails,
  CurationRadioTick,
  CurationRightColumn,
  CurationRow,
  CurationSubRow,
} from '../market_verify'

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

const StatusContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`

const IconWrapper = styled.div`
  border-radius: 50%;
  background-color: ${props => props.theme.colors.green};
  width: 16px;
  height: 16px;
  padding: 3px;
  display: flex;
  margin-left: 8px;
`

const VerifiedTick = styled.img`
  filter: brightness(2);
  width: 100%;
  height: 100%;
`

const Description = styled.div`
  align-items: center;
  border-radius: 4px;
  border: ${props => props.theme.cards.border};
  display: flex;
  padding: 21px 25px;
  color: ${props => props.theme.colors.textColorLightish};
  font-size: 14px;
  letter-spacing: 0.2px;
  line-height: 1.4;
  margin: 25px 0;
  width: 100%;
`

const DescriptionText = styled.p`
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

const SuccessVerify = styled.span`
  color: ${props => props.theme.colors.green};
`

const BlueLink = styled.a`
  color: ${props => props.theme.colors.hyperlink};
`

const RightButton = styled(Button)`
  margin-left: 16px;
`

const RightButtonWrapper = styled.div`
  margin-left: auto;
`

const UnstyledLink = styled.a`
  color: inherit;
`

interface StatefulRadioButton {
  selected?: boolean
}

interface Props {
  selection?: number
  selectSource: (e: ChangeEvent<HTMLInputElement>) => void
  klerosCurationData: KlerosCurationData
}

export const KlerosCuration: React.FC<Props> = (props: Props) => {
  const { klerosCurationData, selectSource, selection } = props
  const {
    challengePeriodDuration,
    listingCriteriaURL,
    marketVerificationData,
    ovmAddress,
    removalBaseDeposit,
    submissionBaseDeposit,
    submissionDeposit,
  } = klerosCurationData || {}
  const { itemID, submissionTime = 0, verificationState: status } = marketVerificationData || {}

  const deadline = submissionTime + Number(challengePeriodDuration)
  const timeRemaining = deadline * 1000 - Date.now()
  const submissionTimeUTC = moment(new Date(Number(submissionTime) * 1000))
    .tz('UTC')
    .format('YYYY-MM-DD - HH:mm [UTC]')

  let klerosDetails
  let KlerosNotice
  let KlerosRightColumn

  switch (status) {
    case MarketVerificationState.NotVerified: {
      klerosDetails = `Request verification with a ${formatEther(submissionDeposit)} ETH security deposit.`
      KlerosNotice = (
        <Description>
          <DescriptionText>
            Make sure your submission complies with the{' '}
            <BlueLink href={listingCriteriaURL} rel="noopener noreferrer" target="_blank">
              listing criteria
            </BlueLink>{' '}
            to avoid challenges. The <b>{formatEther(submissionDeposit)}</b> ETH security deposit will be reimbursed if
            your submission is accepted. The challenge period lasts{' '}
            <b>
              {humanizeDuration(Number(challengePeriodDuration) * 1000, {
                delimiter: ' and ',
                largest: 2,
                round: true,
                units: ['y', 'mo', 'w', 'd', 'h', 'm'],
              })}
            </b>
            .
          </DescriptionText>
        </Description>
      )
      KlerosRightColumn = (
        <>
          <CurationRightColumn>
            <RadioWrapper selected={selection === 0}>
              <CurationRadioTick alt="tick" selected={selection === 0} src={Tick} />
            </RadioWrapper>
          </CurationRightColumn>
          <Input checked={selection === 0} onChange={selectSource} type="radio" value={0} />
        </>
      )
      break
    }
    case MarketVerificationState.SubmissionChallengeable: {
      klerosDetails = `Challenge period pending`
      KlerosNotice = (
        <Description>
          <DescriptionText>
            Market invalid according to the{' '}
            <BlueLink href={listingCriteriaURL} rel="noopener noreferrer" target="_blank">
              listing criteria
            </BlueLink>
            ? Collect <SuccessVerify>{formatEther(submissionBaseDeposit)}</SuccessVerify> ETH upon a successful
            challenge.
          </DescriptionText>
          <RightButtonWrapper>
            <RightButton buttonType={ButtonType.secondaryLine}>
              <UnstyledLink
                href={`https://curate.kleros.io/tcr/${ovmAddress}/${itemID}?action=challenge`}
                rel="noopener noreferrer"
                target="_blank"
              >
                Challenge
              </UnstyledLink>
            </RightButton>
          </RightButtonWrapper>
        </Description>
      )
      KlerosRightColumn = (
        <CurationRightColumn>
          Ends in{' '}
          {humanizeDuration(timeRemaining, {
            delimiter: ' and ',
            largest: 2,
            round: true,
            units: ['y', 'mo', 'w', 'd', 'h', 'm'],
          })}
          <CurationOptionDetails>{submissionTimeUTC}</CurationOptionDetails>
        </CurationRightColumn>
      )
      break
    }
    case MarketVerificationState.RemovalChallengeable: {
      klerosDetails = `Challenge period pending`
      KlerosNotice = (
        <Description>
          <DescriptionText>
            Market valid according to the{' '}
            <BlueLink href={listingCriteriaURL} rel="noopener noreferrer" target="_blank">
              listing criteria
            </BlueLink>{' '}
            ? Collect <SuccessVerify>{formatEther(removalBaseDeposit)}</SuccessVerify> upon a successful challenge.
          </DescriptionText>
          <RightButtonWrapper>
            <RightButton buttonType={ButtonType.secondary}>
              <UnstyledLink
                href={`https://curate.kleros.io/tcr/${ovmAddress}/${itemID}?action=challenge`}
                rel="noopener noreferrer"
                target="_blank"
              >
                Challenge
              </UnstyledLink>
            </RightButton>
          </RightButtonWrapper>
        </Description>
      )
      KlerosRightColumn = (
        <CurationRightColumn>
          <b>
            Ends in{' '}
            {humanizeDuration(timeRemaining, {
              delimiter: ' and ',
              largest: 2,
              round: true,
              units: ['y', 'mo', 'w', 'd', 'h', 'm'],
            })}
          </b>
          <CurationOptionDetails>{submissionTimeUTC}</CurationOptionDetails>
        </CurationRightColumn>
      )
      break
    }
    case MarketVerificationState.WaitingArbitration: {
      klerosDetails = `Market validity challenged`
      KlerosRightColumn = (
        <CurationRightColumn>
          <StatusContainer>
            <BlueLink href={`https://curate.kleros.io/tcr/${ovmAddress}/${itemID}`}>
              Challenge details <IconExclamation />{' '}
            </BlueLink>
          </StatusContainer>
          <CurationOptionDetails>{submissionTimeUTC}</CurationOptionDetails>
        </CurationRightColumn>
      )
      break
    }
    case MarketVerificationState.Verified: {
      klerosDetails = `Verification successful`
      KlerosNotice = (
        <Description>
          <DescriptionText>
            Market invalid according to the{' '}
            <BlueLink href={listingCriteriaURL} rel="noopener noreferrer" target="_blank">
              listing criteria
            </BlueLink>
            ?
          </DescriptionText>
          <RightButtonWrapper>
            <RightButton buttonType={ButtonType.secondaryLine}>
              <UnstyledLink
                href={`https://curate.kleros.io/tcr/${ovmAddress}/${itemID}?action=remove`}
                rel="noopener noreferrer"
                target="_blank"
              >
                Remove Market
              </UnstyledLink>
            </RightButton>
          </RightButtonWrapper>
        </Description>
      )
      KlerosRightColumn = (
        <CurationRightColumn>
          <StatusContainer>
            <SuccessVerify>verified</SuccessVerify>
            <IconWrapper>
              <VerifiedTick alt="tick" src={Tick} />
            </IconWrapper>
          </StatusContainer>
          <CurationOptionDetails>{submissionTimeUTC}</CurationOptionDetails>
        </CurationRightColumn>
      )
      break
    }
    default:
      throw new Error('Invalid market state')
  }

  return (
    <CurationRow key="Kleros">
      <CurationSubRow>
        <CurationLeftColumn>
          <LogoWrapper>
            <IconKleros />
          </LogoWrapper>
        </CurationLeftColumn>
        <CurationCenterColumn>
          <CurationOption>Kleros</CurationOption>
          <CurationOptionDetails>{klerosDetails}</CurationOptionDetails>
        </CurationCenterColumn>
        {KlerosRightColumn}
      </CurationSubRow>
      <CurationSubRow>{KlerosNotice}</CurationSubRow>
    </CurationRow>
  )
}
