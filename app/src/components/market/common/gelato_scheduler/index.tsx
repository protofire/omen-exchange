import React, { DOMAttributes, useEffect } from 'react'
import styled from 'styled-components'

import { GELATO_MIN_USD_THRESH } from '../../../../common/constants'
import { formatDate } from '../../../../util/tools'
import { GelatoData } from '../../../../util/types'
import { DateField, FormRow } from '../../../common'
import { IconAlert } from '../../../common/icons/IconAlert'
import { IconClock } from '../../../common/icons/IconClock'
import { IconCustomize } from '../../../common/icons/IconCustomize'
import { IconGelato } from '../../../common/icons/IconGelato'
import { IconTick } from '../../../common/icons/IconTick'
import { GelatoConditions } from '../gelato_conditions'

const TaskInfoWrapper = styled.div`
  display: flex;
  flex-direction: row;
  font-weight: 500;
`

const TaskInfo = styled.div<{ color?: string }>`
  color: ${props => (props.color ? props.color : props.theme.colors.textColorLightish)};
  font-size: 14px;
  margin: 0 6px 0 0;
  text-align: left;
  vertical-align: middle;
  display: inline-block;
`
const GelatoExtendedWrapper = styled.div<{ isStretch?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${props => (props.isStretch ? 'stretch' : 'center')};
  border-radius: 4px;
  margin-top: 20px;
  padding-top: 16px;
  padding-bottom: 34px;
  padding-right: 25px;
  padding-left: 25px;
  border: 1px solid ${props => props.theme.borders.borderDisabled};
`

const TaskStatusWrapper = styled.div`
  display: flex;
  line-height: 16px;
  font-size: 14px;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  margin-left: 8px;
  flex-wrap: nowrap;
  width: 90%;
`

const ConditionWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 20px;
  vertical-align: bottom;
  justify-content: space-between;
`

const ConditionTitle = styled.div`
  font-size: 14px;
  letter-spacing: 0.2px;
  line-height: 1.4;
  text-align: left;
  color: #37474f;
`

const IconStyled = styled.div`
  line-height: 1;
  svg {
    width: 0.9rem;
    height: 0.9rem;
    vertical-align: inherit;
  }
`
const GelatoIconCircle = styled.button<{ active?: boolean }>`
  align-items: center;
  background-color: #fff;
  border-radius: 50%;
  border: 1px solid ${props => props.theme.colors.tertiary};
  display: flex;
  flex-shrink: 0;
  height: ${props => props.theme.buttonCircle.dimensions};
  justify-content: center;
  outline: none;
  padding: 0;
  transition: border-color 0.15s linear;
  user-select: none;
  width: ${props => props.theme.buttonCircle.dimensions};
`

const Wrapper = styled.div`
  border-radius: 4px;
  border: ${({ theme }) => theme.borders.borderLineDisabled};
  padding: 18px 25px;
  margin-bottom: 20px;
`

const Title = styled.h2`
  color: ${props => props.theme.colors.textColorDark};
  font-size: 16px;
  letter-spacing: 0.4px;
  line-height: 1.2;
  margin: 0 0 20px;
  font-weight: 400;
`

const DescriptionWrapper = styled.div`
  align-items: center;
  display: flex;
`

const CheckService = styled.div<{ isActive: boolean; disabled?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  text-align: center;
  border: 1px solid ${props => (props.isActive ? props.theme.colors.transparent : props.theme.colors.tertiary)};
  background-color: ${props => (props.isActive ? props.theme.colors.clickable : props.theme.colors.mainBodyBackground)};
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    border: 1px solid ${props => (props.isActive ? 'none' : props.theme.colors.tertiaryDark)};
    cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  }
  &:active {
    border: none;
  }
  path {
    fill: ${props => (props.isActive ? props.theme.colors.mainBodyBackground : props.theme.textfield.textColorDark)};
  }
`

const ToggleService = styled.div<{ isActive: boolean; disabled?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  text-align: center;
  border: 1px solid ${props => (props.isActive ? props.theme.colors.transparent : props.theme.colors.tertiary)};
  background-color: ${props =>
    props.isActive ? props.theme.buttonSecondary.backgroundColor : props.theme.colors.mainBodyBackground};
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    border: 1px solid ${props => (props.isActive ? 'none' : props.theme.colors.tertiaryDark)};
    cursor: ${props => (props.disabled ? 'none' : 'pointer')};
  }
  &:active {
    border: none;
  }
  path {
    fill: ${props => (props.isActive ? '#3F51B5' : '#37474F')};
  }
`

const ServiceWrapper = styled.div`
  color: ${props => props.theme.colors.textColorLightish};
  font-size: ${props => props.theme.textfield.fontSize};
  letter-spacing: 0.2px;
  line-height: 1.4;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-box-pack: justify;
`

const ServiceIconWrapper = styled.div`
  display: flex;
  padding-right: 16px;
  text-align: center;
  -webkit-box-align: center;
`

const ServiceTextWrapper = styled.div<{ short?: boolean }>`
  width: ${props => (props.short ? '50%' : '90%')};
`

const ServiceCheckWrapper = styled.div`
  width: 10%;
  color: transparent;
`
const ServiceToggleWrapper = styled.div`
  width: 10%;
  color: transparent;
  margin-right: 12px;
`

const ServiceTokenDetails = styled.div`
  width: 100%;
  display: flex;
`

const GelatoServiceDescription = styled.div`
  color: ${props => props.theme.colors.textColorLightish};
  font-size: ${props => props.theme.textfield.fontSize};
  letter-spacing: 0.2px;
  line-height: 1.4;
  margin: 0 8px 0 0;
  width: 100%;
`

const TextHeading = styled.div`
  color: ${props => props.theme.colors.textColorDark};
  font-weight: 500;
  font-size: 14px;
  line-height: 16px;
  display: flex;
  align-items: center;
  letter-spacing: 0.2px;
  margin: 0px 6px 0px 0px;
  width: 200px;
`

const TextBody = styled.div<{ margins?: string; textAlignRight?: boolean }>`
  line-height: 16px;
  font-size: 14px;
  height: 16px;
  color: #86909e;
  margin: ${props => (props.margins ? props.margins : '6px 6px 0px 0px')};
  text-align: ${props => (props.textAlignRight ? 'right' : 'left')};
`

const TextBodyMarker = styled.span<{ color?: string }>`
  color: ${props => (props.color ? props.color : props.theme.colors.textColorLightish)};
  font-weight: 500;
`

export type GelatoSchedulerProps = DOMAttributes<HTMLDivElement> & {
  resolution: Date
  gelatoData: GelatoData
  isScheduled: boolean
  execSuccess?: boolean
  belowMinimum?: boolean
  minimum?: number
  collateralToWithdraw?: string
  collateralSymbol?: string
  taskStatus?: string
  etherscanLink?: string
  handleGelatoDataChange: (gelatoData: GelatoData) => any
  handleGelatoDataInputChange: (newDate: Date | null) => any
}

export const GelatoScheduler: React.FC<GelatoSchedulerProps> = (props: GelatoSchedulerProps) => {
  const {
    belowMinimum,
    collateralSymbol,
    collateralToWithdraw,
    etherscanLink,
    gelatoData,
    handleGelatoDataChange,
    handleGelatoDataInputChange,
    isScheduled,
    minimum,
    resolution,
    taskStatus,
  } = props

  const [active, setActive] = React.useState(false)
  const [customizable, setCustomizable] = React.useState(false)

  // Set gelatoInput default to resolution - 3 days (or fifteen minutes from now)
  const resolutionDateCopy = new Date(resolution)
  const now = new Date()
  now.setMinutes(now.getMinutes() + 30)
  if (!gelatoData.input) {
    const defaultGelatoDate = new Date(resolutionDateCopy.setDate(resolutionDateCopy.getDate() - 3))
    if (now.getTime() - defaultGelatoDate.getTime() > 0) {
      gelatoData.input = now
    } else {
      gelatoData.input = defaultGelatoDate
    }
  }

  const daysBeforeWithdraw = Math.round(
    (Date.parse(resolution.toString()) - Date.parse(gelatoData.input.toString())) / 1000 / 60 / 60 / 24,
  )

  const daysUntilWithdraw = Math.round(
    (Date.parse(gelatoData.input.toString()) - Date.parse(new Date().toString())) / 1000 / 60 / 60 / 24,
  )

  const toggleActive = () => {
    const newGelatoCondition = {
      ...gelatoData,
    }
    const isTrue = active ? false : true
    newGelatoCondition.shouldSubmit = isTrue
    handleGelatoDataChange(newGelatoCondition)
    setActive(isTrue)
  }

  const toggleCustomizable = () => {
    setCustomizable(!customizable)
  }

  const getCorrectTimeString = (withdrawalDate: Date) => {
    const daysUntilAutoWithdraw = Math.round(
      (Date.parse(withdrawalDate.toString()) - Date.parse(new Date().toString())) / 1000 / 60 / 60 / 24,
    )
    const hoursUntilAutoWithdraw = Math.round(
      (Date.parse(withdrawalDate.toString()) - Date.parse(new Date().toString())) / 1000 / 60 / 60,
    )

    const minUntilAutoWithdraw = Math.round(
      (Date.parse(withdrawalDate.toString()) - Date.parse(new Date().toString())) / 1000 / 60,
    )

    let displayText = `${daysUntilAutoWithdraw} days`
    if (daysUntilAutoWithdraw === 0)
      if (hoursUntilAutoWithdraw === 0)
        if (minUntilAutoWithdraw === 0) displayText = `now`
        else displayText = `${minUntilAutoWithdraw} minutes`
      else displayText = `${hoursUntilAutoWithdraw} hours`

    return displayText
  }

  useEffect(() => {
    if (belowMinimum) {
      setActive(false)
    }
  }, [belowMinimum])

  const getTaskStatus = (status?: string, withdrawlDate?: Date) => {
    if (withdrawlDate && status) {
      const displayText = getCorrectTimeString(withdrawlDate)
      switch (status) {
        case 'awaitingExec':
          return (
            <TaskInfoWrapper>
              <TaskInfo color="#4B9E98">{`scheduled in ${displayText}`}</TaskInfo>
              <IconStyled color={'#4B9E98'}>
                <IconClock></IconClock>
              </IconStyled>
            </TaskInfoWrapper>
          )
        case 'execSuccess':
          return (
            <TaskInfoWrapper>
              <TaskInfo color="#4B9E98">{`successful`}</TaskInfo>
              <IconStyled>
                <IconTick fill={'#4B9E98'} />
              </IconStyled>
            </TaskInfoWrapper>
          )
        case 'execReverted':
          return (
            <TaskInfoWrapper>
              <TaskInfo color="red">{`failed`}</TaskInfo>
              <IconStyled>
                <IconAlert bg={'red'} fill={'white'}></IconAlert>
              </IconStyled>
            </TaskInfoWrapper>
          )
        case 'canceled':
          return (
            <TaskInfoWrapper>
              <TaskInfo color="red">{`canceled `}</TaskInfo>
              <IconStyled>
                <IconAlert bg={'red'} fill={'white'}></IconAlert>
              </IconStyled>
            </TaskInfoWrapper>
          )
      }
    }
  }

  return (
    <Wrapper>
      <Title>Recommended Services</Title>
      <DescriptionWrapper>
        <GelatoServiceDescription>
          <ServiceWrapper>
            <ServiceIconWrapper>
              <GelatoIconCircle>
                <IconGelato />
              </GelatoIconCircle>
            </ServiceIconWrapper>
            <ServiceTokenDetails>
              {!isScheduled && (
                <>
                  <ServiceTextWrapper>
                    <TextHeading>Gelato</TextHeading>
                    {active && !belowMinimum && (
                      <TextBody margins={'6px 25px 0px 0px'}>
                        Auto-Withdrawal scheduled in
                        <TextBodyMarker> {daysUntilWithdraw} days </TextBodyMarker>
                      </TextBody>
                    )}
                    {!active && (
                      <TextBody margins={'6px 25px 0px 0px'}>
                        Schedule withdrawal with min. funding of
                        <TextBodyMarker>
                          {`${
                            minimum
                              ? ` ${Math.ceil(minimum * 1000) / 1000} ${collateralSymbol}`
                              : ` ${GELATO_MIN_USD_THRESH} USD`
                          }`}
                        </TextBodyMarker>
                      </TextBody>
                    )}
                  </ServiceTextWrapper>
                  {active && (
                    <ServiceToggleWrapper onClick={toggleCustomizable}>
                      <ToggleService isActive={customizable}>
                        <IconCustomize />
                      </ToggleService>
                    </ServiceToggleWrapper>
                  )}
                  <ServiceCheckWrapper onClick={belowMinimum ? undefined : toggleActive}>
                    <CheckService disabled={belowMinimum} isActive={active}>
                      <IconTick
                        disabled={belowMinimum}
                        fill={belowMinimum ? '#86909E' : active ? 'white' : '#37474F'}
                        stroke={belowMinimum ? '#86909E' : active ? 'white' : '#37474F'}
                      />
                    </CheckService>
                  </ServiceCheckWrapper>
                </>
              )}
              {isScheduled && taskStatus && (
                <>
                  <ServiceTextWrapper short={true}>
                    <TextHeading>
                      {`Auto-Withdraw ${
                        taskStatus === 'execSuccess' ? '' : `${collateralToWithdraw} ${collateralSymbol}`
                      }`}
                    </TextHeading>
                    <TextBody margins={'6px 0px 0px 0px'}>Powered by Gelato Network</TextBody>
                  </ServiceTextWrapper>
                  <TaskStatusWrapper>
                    {getTaskStatus(taskStatus, gelatoData.input)}
                    <TextBody margins={'6px 0 0 0'} textAlignRight={true}>
                      {`${formatDate(gelatoData.input)}`}
                    </TextBody>
                  </TaskStatusWrapper>
                </>
              )}
            </ServiceTokenDetails>
          </ServiceWrapper>
        </GelatoServiceDescription>
      </DescriptionWrapper>
      {taskStatus === 'awaitingExec' && (
        <GelatoExtendedWrapper>
          <TextBody margins={'0 0 0 0'}>
            {`Gelato will automatically withdraw your liquidity of ${collateralToWithdraw} ${collateralSymbol} on ${formatDate(
              gelatoData.input,
            )} (with a network fee deducted from the withdrawn ${collateralSymbol}). Cancel the auto-withdraw by manually withdrawing your liquidity.`}
          </TextBody>
        </GelatoExtendedWrapper>
      )}
      {taskStatus === 'execReverted' && (
        <GelatoExtendedWrapper>
          <TextBody margins={'0 0 0 0'}>
            {`Your provided liquidity was insufficient on ${formatDate(
              gelatoData.input,
            )} to pay for for the withdrawal transaction `}
            <span>
              <a href={etherscanLink} rel="noopener noreferrer" style={{ color: '#1E88E5' }} target="_blank">
                here
              </a>
            </span>
            {'.'}
          </TextBody>
        </GelatoExtendedWrapper>
      )}
      {taskStatus === 'execSuccess' && (
        <GelatoExtendedWrapper>
          <TextBody margins={'0 0 0 0'}>
            {`Your provided liquidity was successfully withdrawn on ${formatDate(
              gelatoData.input,
            )}. Check out the transaction `}
            <span>
              <a href={etherscanLink} rel="noopener noreferrer" style={{ color: '#1E88E5' }} target="_blank">
                here
              </a>
            </span>
            {'.'}
          </TextBody>
        </GelatoExtendedWrapper>
      )}
      {customizable && active && !taskStatus && (
        <GelatoExtendedWrapper isStretch={true}>
          <ConditionWrapper>
            <ConditionTitle>Withdraw Condition</ConditionTitle>
            <FormRow
              formField={
                <GelatoConditions disabled={true} onChangeGelatoCondition={handleGelatoDataChange} value={gelatoData} />
              }
              style={{ marginTop: '0' }}
            />
          </ConditionWrapper>
          <ConditionWrapper>
            <ConditionTitle>Withdraw Date and Time</ConditionTitle>
            <FormRow
              formField={
                <DateField
                  disabled={false}
                  maxDate={new Date(resolutionDateCopy.setHours(resolution.getHours() - 6))}
                  minDate={new Date()}
                  name="gelato-date"
                  onChange={handleGelatoDataInputChange}
                  selected={gelatoData.input}
                />
              }
              style={{ marginTop: '0' }}
            />
          </ConditionWrapper>
          <TextBody>
            Gelato will automatically withdraw your liquidity
            <TextBodyMarker>{` ${daysBeforeWithdraw} day(s) before `}</TextBodyMarker>
            the market will close on
            <TextBodyMarker>{` ${formatDate(gelatoData.input)}`}</TextBodyMarker>
          </TextBody>
        </GelatoExtendedWrapper>
      )}
    </Wrapper>
  )
}
