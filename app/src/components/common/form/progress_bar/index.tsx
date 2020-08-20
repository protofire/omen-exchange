import React, { DOMAttributes, useCallback, useEffect, useState } from 'react'
import styled, { css } from 'styled-components'

import {} from '../common_styled'

export enum OpenProgressBar {
  title,
  position,
}

export enum FinalizedProgressBar {
  title,
  position,
}

export enum ArbitrationProgressBar {
  title,
  position,
}

export enum ClosedProgressBar {
  title,
  position,
}

const ProgressBarBlank = css`
    display: flex,
    flex-direction: row,
    height: 12px,
    width: 226px,
    color: #FFFFF,
    border-radius: 32px,
    border: 1px solid ${props => props.theme.colors.border},
    position: absolute,
`

const ProgressBarOpen = css`
    display: flex,
    flex-direction: row,
    height: 12px,
    width: 226px,
    color: ${props => props.theme.colors.progressBarOpen},
    border-radius: 32px,
    border: 1px solid ${props => props.theme.colors.border},
    position: absolute
`
const ProgressBarFinalized = css`
    display: flex,
    flex-direction: row,
    height: 12px,
    width: 226px,
    color: ${props => props.theme.colors.progressBarFinalized},
    border-radius: 32px,
    border: 1px solid ${props => props.theme.colors.border},
    border-sizing: border-box,
    position: absolute
`
const ProgressBarClosed = css`
    display: flex,
    flex-direction: row,
    height: 12px,
    width: 138px,
    color: ${props => props.theme.colors.progressBarClosed},
    border-radius: 32px,
    border: 1px solid ${props => props.theme.colors.border},
    position: absolute
`
const progressBarClosed1 = css`
    display: flex,
    flex-direction: row,
    height: 12px,
    width: 
`

const ProgressBarContainer = styled.div`
    flex-shrink: 0;
    ProgressBarBlank
`

interface Props extends DOMAttributes<HTMLDivElement> {
  id: string | undefined
  currentItem?: number | undefined
  OpenProgressBar?: OpenProgressBar | undefined
  FinalizedProgressBar?: FinalizedProgressBar | undefined
  ArbitrationProgressBar?: ArbitrationProgressBar | undefined
  ClosedProgressBar?: ClosedProgressBar | undefined
  items: any
  placeholder?: React.ReactNode | string | undefined
}

export const ProgressBar: React.FC<Props> = props => {
  const {
    ArbitrationProgressBar,
    ClosedProgressBar,
    FinalizedProgressBar,
    OpenProgressBar,
    currentItem = 0,
    id = 0,
    items,
    placeholder,
  } = props

  return <ProgressBarContainer></ProgressBarContainer>
}
