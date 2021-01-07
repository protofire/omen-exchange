import React, { DOMAttributes } from 'react'
import styled from 'styled-components'

import { GELATO_MIN_USD_THRESH } from '../../../../common/constants'
import { formatDate } from '../../../../util/tools'
import { GelatoData } from '../../../../util/types'
import { ButtonCircle } from '../../../button'
import { DateField, FormRow } from '../../../common'
import { IconAlert } from '../../../common/icons/IconAlert'
import { IconClock } from '../../../common/icons/IconClock'
import { IconFilter } from '../../../common/icons/IconFilter'
import { IconGelato } from '../../../common/icons/IconGelato'
import { IconTick } from '../../../common/icons/IconTick'
import { GelatoConditions } from '../gelato_conditions'

const Wrapper = styled.div<{ noMarginBottom: boolean }>`
  ${props => (props.noMarginBottom ? 'margin-bottom: 0;' : 'margin-bottom: 24px')};
`

const Title = styled.h2`
  color: ${props => props.theme.colors.textColorDarker};
  font-size: 16px;
  letter-spacing: 0.4px;
  line-height: 1.2;
  margin: 0 0 20px;
  font-weight: 400;
`

const Box = styled.div<{ boxType: string; isRow?: boolean }>`
  display: flex;
  flex-direction: ${props => (props.isRow ? 'row' : 'column')};
  ${props =>
    props.boxType == 'outer'
      ? `align-items: stretch;
        border-radius: 4px;
        padding: 21px 25px;
        border: 1px solid ${props.theme.borders.borderDisabled};`
      : ''}
  ${props =>
    props.boxType == 'title'
      ? `align-items: flex-start;
        margin-left: 8px;
        flex-wrap: nowrap;`
      : ''}
  ${props =>
    props.boxType == 'subtitle'
      ? `align-items: flex-end;
        justify-content: center;
        margin-left: 8px;
        flex-wrap: nowrap;`
      : ''}
  ${props =>
    props.boxType == 'condition'
      ? `align-items: center;
        margin-bottom: 12px;
        vertical-align: bottom;
        justify-content: space-between;`
      : ''}
`

const Description = styled.p<{ descriptionType: string; textAlignRight?: boolean }>`
  color: ${props => (props.descriptionType == 'task' ? props.color : props.theme.colors.textColorLightish)};
  font-size: 14px;
  letter-spacing: 0.2px;
  line-height: 1.4;
  ${props =>
    props.descriptionType == 'standard'
      ? 'margin: 0 25px 0 0;'
      : props.descriptionType == 'task'
      ? 'margin: 0 4px 0 0;'
      : props.descriptionType == 'mini'
      ? 'margin: 2px 0 0 0;'
      : ''}
  ${props =>
    props.descriptionType == 'condition' ? '' : props.textAlignRight ? 'text-align: right;' : 'text-align: left;'}
  ${props => (props.descriptionType == 'condition' ? '' : 'vertical-align: middle;\ndisplay: inline-block;')}
`

const ButtonCircleStyled = styled(ButtonCircle)<{ disabled?: boolean; filled?: boolean }>`
  svg {
    filter: ${props =>
      props.disabled
        ? 'invert(46%) sepia(0%) saturate(1168%) hue-rotate(183deg) brightness(99%) contrast(89%)'
        : 'none'};
    ${props => (props.filled ? `fill: ${props.theme.colors.mainBodyBackground};` : '')}
  }
  ${props => (props.filled ? `background-color: ${props.theme.colors.clickable};` : '')}
  margin-right: 5px;
`

const IconStyled = styled.div<{ color?: string; large?: boolean; stroke?: string }>`
  line-height: 1;
  svg {
    fill: ${props => props.color};
    width: ${props => (props.large ? '1rem' : '0.9rem')};
    height: ${props => (props.large ? '1rem' : '0.9rem')};
    vertical-align: inherit;
    ${props => (props.stroke ? `stroke: ${props.stroke};` : '')}
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

export type GelatoSchedulerProps = DOMAttributes<HTMLDivElement> & {
  noMarginBottom: boolean
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
    noMarginBottom,
    resolution,
    taskStatus,
    ...restProps
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

  const getTaskStatus = (status?: string, withdrawlDate?: Date, belowMinimum?: boolean, minimum?: number) => {
    if (withdrawlDate && status) {
      const displayText = getCorrectTimeString(withdrawlDate)
      switch (status) {
        case 'awaitingExec':
          return (
            <Box boxType={'task'} isRow={true}>
              <Description color="green" descriptionType={'task'}>{`scheduled in ${displayText}`}</Description>
              <IconStyled color={'green'}>
                <IconClock></IconClock>
              </IconStyled>
            </Box>
          )
        case 'execSuccess':
          return (
            <Box boxType={'task'} isRow={true}>
              <Description color="green" descriptionType={'task'}>{`successful`}</Description>
              <IconStyled>
                <IconTick fill={'green'} />
              </IconStyled>
            </Box>
          )
        case 'execReverted':
          return (
            <Box boxType={'task'} isRow={true}>
              <Description color="red" descriptionType={'task'}>{`failed`}</Description>
              <IconStyled>
                <IconAlert bg={'red'} fill={'white'}></IconAlert>
              </IconStyled>
            </Box>
          )
        case 'canceled':
          return (
            <Box boxType={'task'} isRow={true}>
              <Description color="red" descriptionType={'task'}>{`canceled`}</Description>
              <IconStyled>
                <IconAlert bg={'red'} fill={'white'}></IconAlert>
              </IconStyled>
            </Box>
          )
      }
    } else if (belowMinimum) {
      return (
        <Box boxType={'task'} isRow={true}>
          <Description color="red" descriptionType={'task'}>
            {`To enable Gelato deposit at least ${
              minimum ? `${minimum.toFixed(3)} ${collateralSymbol}` : `${GELATO_MIN_USD_THRESH} USD`
            }`}
          </Description>
          <IconStyled>
            <IconAlert bg={'red'} fill={'white'}></IconAlert>
          </IconStyled>
        </Box>
      )
    }
  }

  return (
    <Wrapper noMarginBottom={noMarginBottom} {...restProps}>
      <Title>Recommended Services</Title>
      <Box boxType={'outer'} isRow={true}>
        <GelatoIconCircle>
          <IconGelato />
        </GelatoIconCircle>
        {!isScheduled && !belowMinimum && (
          <>
            <Box boxType={'title'} isRow={false}>
              <Description descriptionType={'standard'} style={{ fontWeight: 500 }} textAlignRight={false}>
                Gelato
              </Description>
              <Description
                descriptionType={'standard'}
                textAlignRight={false}
              >{`Automatically withdraw liquidity ${daysBeforeWithdraw} days before market ends`}</Description>
            </Box>

            <ButtonCircleStyled
              active={active ? true : false}
              disabled={active ? false : true}
              filled={false}
              onClick={toggleCustomizable}
            >
              <IconFilter />
            </ButtonCircleStyled>

            {!active && (
              <ButtonCircleStyled
                active={true}
                disabled={false}
                filled={false}
                onClick={toggleActive}
                style={{ backgroundColor: 'white' }}
              >
                <IconStyled large={true}>
                  <IconTick />
                </IconStyled>
              </ButtonCircleStyled>
            )}
            {active && (
              <ButtonCircleStyled filled={true} onClick={toggleActive}>
                <IconStyled large={true}>
                  <IconTick fill={'white'} selected={true} />
                </IconStyled>
              </ButtonCircleStyled>
            )}
          </>
        )}
        {isScheduled && taskStatus && (
          <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row', width: '100%' }}>
            <Box boxType={'title'} isRow={false}>
              <Description descriptionType={'standard'} textAlignRight={false}>
                <strong>
                  {`Auto-Withdraw ${taskStatus === 'execSuccess' ? '' : `${collateralToWithdraw} ${collateralSymbol}`}`}
                </strong>
              </Description>
              <Description descriptionType={'mini'} textAlignRight={false}>{`Powered by Gelato Network`}</Description>
            </Box>

            <Box boxType={'subtitle'} isRow={false}>
              {getTaskStatus(taskStatus, gelatoData.input, belowMinimum, minimum)}

              <Description descriptionType={'mini'} textAlignRight={true}>
                {`${formatDate(gelatoData.input)}`}
              </Description>
            </Box>
          </div>
        )}
        {belowMinimum && !taskStatus && (
          <>
            <Box boxType={'title'} isRow={false}>
              <Description descriptionType={'standard'} style={{ fontWeight: 500 }} textAlignRight={false}>
                Gelato
              </Description>
              <Description
                descriptionType={'standard'}
                textAlignRight={false}
              >{`Automatically withdraw liquidity ${daysBeforeWithdraw} days before market ends`}</Description>
            </Box>
            <Box boxType={'subtitle'} isRow={false}>
              {getTaskStatus(undefined, undefined, belowMinimum, minimum)}
            </Box>
          </>
        )}
      </Box>
      {taskStatus === 'awaitingExec' && (
        <Box boxType={'outer'} isRow={false}>
          <Description descriptionType={'standard'} textAlignRight={false}>
            {`Gelato will automatically withdraw your liquidity of ${collateralToWithdraw} ${collateralSymbol} on ${formatDate(
              gelatoData.input,
            )} (with a network fee deducted from the withdrawn ${collateralSymbol}). Cancel the auto-withdraw by manually withdrawing your liquidity.`}
          </Description>
        </Box>
      )}
      {taskStatus === 'execReverted' && (
        <Box boxType={'outer'} isRow={false}>
          <Description descriptionType={'standard'} textAlignRight={false}>
            {`Your provided liquidity was insufficient on ${formatDate(
              gelatoData.input,
            )} to pay for for the withdrawal transaction `}
            <span>
              <a href={etherscanLink} rel="noopener noreferrer" style={{ color: '#1E88E5' }} target="_blank">
                here
              </a>
            </span>
            {'.'}
          </Description>
        </Box>
      )}
      {taskStatus === 'execSuccess' && (
        <Box boxType={'outer'} isRow={false}>
          <Description descriptionType={'standard'} textAlignRight={false}>
            {`Your provided liquidity was successfully withdrawn on ${formatDate(
              gelatoData.input,
            )}. Check out the transaction `}
            <span>
              <a href={etherscanLink} rel="noopener noreferrer" style={{ color: '#1E88E5' }} target="_blank">
                here
              </a>
            </span>
            {'.'}
          </Description>
        </Box>
      )}
      {customizable && (
        <Box boxType={'outer'} isRow={false}>
          <Box boxType={'condition'} isRow={true}>
            <Description descriptionType={'condition'}>Withdraw Condition</Description>
            <FormRow
              formField={
                <GelatoConditions disabled={true} onChangeGelatoCondition={handleGelatoDataChange} value={gelatoData} />
              }
              style={{ marginTop: '0' }}
            />
          </Box>
          <Box boxType={'condition'} isRow={true}>
            <Description descriptionType={'condition'}>Withdraw Date and Time</Description>
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
          </Box>
          <Description descriptionType={'standard'} textAlignRight={false}>
            Gelato will automatically withdraw your liquidity<strong>{` ${daysBeforeWithdraw} day(s) before `}</strong>
            the market will close on<strong>{` ${formatDate(gelatoData.input)}`}</strong>
          </Description>
        </Box>
      )}
    </Wrapper>
  )
}
