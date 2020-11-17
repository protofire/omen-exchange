import { formatEther } from 'ethers/utils'
import moment from 'moment-timezone'
import React, { FC } from 'react'
import styled from 'styled-components'

import { DOCUMENT_VALIDITY_RULES } from '../../../../../common/constants'
import { KlerosCurationData, MarketVerificationState } from '../../../../../util/types'
import { Button } from '../../../../button'
import { ButtonType } from '../../../../button/button_styling_types'
import { IconExclamation, IconKleros, IconSchedule, IconTick } from '../../../../common/icons'
import {
  CurationCenterColumn,
  CurationLeftColumn,
  CurationLogoWrapper,
  CurationOption,
  CurationOptionDetails,
  CurationRadioWrapper,
  CurationRightColumn,
  CurationRow,
  CurationSubRow,
} from '../market_verify'

const Bold = styled.b`
  font-weight: 500;
`

const IconStatusWrapper = styled.div`
  margin-left: 8px;
`

const TimeRemainingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  text-transform: lowercase;
  color: ${props => props.theme.colors.textColorDark};
`

const StatusContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  text-transform: lowercase;
  font-size: 14px;
`

const IconWrapper = styled.div`
  border-radius: 50%;
  background-color: ${props => props.theme.colors.green};
  width: 16px;
  height: 16px;
  padding: 3px;
  display: flex;
  margin-left: 8px;
  svg {
    filter: brightness(2);
    width: 100%;
    height: 100%;
  }
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
  margin-top: 20px;
  width: 100%;
`

const DescriptionText = styled.p`
  display: inline-block;
  margin: 0;
`

const SuccessVerify = styled.span`
  color: ${props => props.theme.colors.green};
  font-weight: ${props => props.theme.textfield.fontWeight};
`

const BlueLink = styled.a`
  color: ${props => props.theme.colors.clickable};
  font-weight: ${props => props.theme.textfield.fontWeight};
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

interface Props {
  option?: number
  selectSource: (option: number) => void
  klerosCurationData: KlerosCurationData
}

const KLEROS_OPTION = 0

export const KlerosCuration: FC<Props> = (props: Props) => {
  const { klerosCurationData, option, selectSource } = props
  const {
    challengePeriodDuration,
    marketVerificationData,
    ovmAddress,
    removalBaseDeposit,
    submissionBaseDeposit,
    submissionDeposit,
  } = klerosCurationData || {}
  const { itemID, submissionTime = 0, verificationState: status } = marketVerificationData || {}
  const deadline = submissionTime + Number(challengePeriodDuration)
  const timeRemaining = Math.max(0, deadline * 1000 - Date.now())

  const submissionTimeUTC = moment(new Date(Number(submissionTime) * 1000))
    .tz('UTC')
    .format('DD.MM.YYYY - HH:mm [UTC]')

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
            <BlueLink href={DOCUMENT_VALIDITY_RULES} rel="noopener noreferrer" target="_blank">
              listing criteria
            </BlueLink>{' '}
            to avoid challenges. The <Bold>{formatEther(submissionDeposit)}</Bold> ETH security deposit will be
            reimbursed if your submission is accepted. The challenge period lasts{' '}
            <Bold>{moment.duration(Number(challengePeriodDuration) * 1000).humanize()}</Bold>.
          </DescriptionText>
        </Description>
      )
      KlerosRightColumn = (
        <>
          <CurationRightColumn>
            <CurationRadioWrapper onClick={() => selectSource(KLEROS_OPTION)} selected={option === KLEROS_OPTION}>
              <IconTick selected={option === KLEROS_OPTION} />
            </CurationRadioWrapper>
          </CurationRightColumn>
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
            <BlueLink href={DOCUMENT_VALIDITY_RULES} rel="noopener noreferrer" target="_blank">
              listing criteria
            </BlueLink>
            ?<br /> Collect <SuccessVerify>{formatEther(submissionBaseDeposit)} ETH</SuccessVerify> upon a successful
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
          <TimeRemainingContainer>
            Ends in {moment.duration(timeRemaining).humanize()}
            <IconStatusWrapper>
              <IconSchedule />
            </IconStatusWrapper>
          </TimeRemainingContainer>
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
            <BlueLink href={DOCUMENT_VALIDITY_RULES} rel="noopener noreferrer" target="_blank">
              listing criteria
            </BlueLink>{' '}
            ?<br /> Collect <SuccessVerify>{formatEther(removalBaseDeposit)} ETH</SuccessVerify> upon a successful
            challenge.
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
          <TimeRemainingContainer>
            Ends in {moment.duration(timeRemaining).humanize()}{' '}
            <IconStatusWrapper>
              <IconSchedule />
            </IconStatusWrapper>
          </TimeRemainingContainer>
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
            <BlueLink href={`https://curate.kleros.io/tcr/${ovmAddress}/${itemID}`}>challenge details </BlueLink>
            <IconStatusWrapper>
              <IconExclamation />
            </IconStatusWrapper>
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
            <BlueLink href={DOCUMENT_VALIDITY_RULES} rel="noopener noreferrer" target="_blank">
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
          <StatusContainer
            as="a"
            href={`https://curate.kleros.io/tcr/${ovmAddress}/${itemID}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            <SuccessVerify>verified</SuccessVerify>
            <IconWrapper>
              <IconTick />
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
          <CurationLogoWrapper>
            <IconKleros id="curationSource" />
          </CurationLogoWrapper>
        </CurationLeftColumn>
        <CurationCenterColumn>
          <CurationOption>Kleros</CurationOption>
          <CurationOptionDetails>{klerosDetails}</CurationOptionDetails>
        </CurationCenterColumn>
        {KlerosRightColumn}
      </CurationSubRow>
      {(option === KLEROS_OPTION ||
        status === MarketVerificationState.RemovalChallengeable ||
        status === MarketVerificationState.SubmissionChallengeable ||
        status === MarketVerificationState.Verified) && <CurationSubRow>{KlerosNotice}</CurationSubRow>}
    </CurationRow>
  )
}
