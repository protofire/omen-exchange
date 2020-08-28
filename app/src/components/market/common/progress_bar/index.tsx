import React, { DOMAttributes } from 'react'
import styled from 'styled-components'

const ProgressBarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 40px;
  margin-bottom: 29px;
  margin-top: 8px;
`

const ProgressBarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: calc(100% + 24px);
  margin: 0 -12px;
`

const ProgressBarDot = styled.div`
  height: 12px;
  width: 12px;
  border-radius: 50%;
  border: 1px solid ${props => props.theme.buttonPrimaryLine.borderColor};
  margin: 0 12px;
`

const ProgressBarLine = styled.div`
  height: 12px;
  border-radius: 32px;
  border: 1px solid ${props => props.theme.buttonPrimaryLine.borderColor};
  flex-grow: 1;
`

const ProgressBarTitles = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const ProgressBarTitle = styled.div`
  color: ${props => props.theme.colors.textColor}
  font-size: 14px;
  line-height: 16px;
  font-weight: 400;
  width: 33.333%;
  text-align: center;

  &:first-child {
    text-align: left;
    width: 16.666%;
  }
  &:last-child {
    text-align: right;
    width: 16.666%;
  }
`

interface Props extends DOMAttributes<HTMLDivElement> {
  state: 'Open' | 'Pending' | 'Finalizing' | 'Ended'
  creationTimestamp: Date
  resolutionTimestamp: Date
}

export const ProgressBar: React.FC<Props> = props => {
  return (
    <ProgressBarWrapper>
      <ProgressBarContainer>
        <ProgressBarDot></ProgressBarDot>
        <ProgressBarLine></ProgressBarLine>
        <ProgressBarDot></ProgressBarDot>
        <ProgressBarLine></ProgressBarLine>
        <ProgressBarDot></ProgressBarDot>
        <ProgressBarLine></ProgressBarLine>
        <ProgressBarDot></ProgressBarDot>
      </ProgressBarContainer>
      <ProgressBarTitles>
        <ProgressBarTitle>
          Open
        </ProgressBarTitle>
        <ProgressBarTitle>
          Finalizing
        </ProgressBarTitle>
        <ProgressBarTitle>
          Arbitration
        </ProgressBarTitle>
        <ProgressBarTitle>
          Closed
        </ProgressBarTitle>
      </ProgressBarTitles>
    </ProgressBarWrapper>
  )
}