import React, { DOMAttributes } from 'react'
import styled from 'styled-components'

interface Props extends DOMAttributes<HTMLDivElement> {
  resolutionTimestamp: Date
  dailyVolume: number
  currency: string
}

export const MarketData: React.FC<Props> = props => {
  return (
    <>
      Market Data
    </>
  )
}