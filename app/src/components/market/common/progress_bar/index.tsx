import React, { DOMAttributes } from 'react'
import styled from 'styled-components'

const ProgressBarWrapper = styled.div`

`

const ProgressBarContainer = styled.div`

`

const ProgressBarDot = styled.div`

`

const ProgressBarLine = styled.div`

`

const ProgressBarTitles = styled.div`

`

const ProgressBarTitle = styled.div`

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