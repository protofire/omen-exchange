import React, { DOMAttributes } from 'react'
import styled from 'styled-components'

interface Props extends DOMAttributes<HTMLDivElement> {
  category: string
  arbitrator: string
  oracle: string
}

export const AdditionalMarketData: React.FC<Props> = props => {
  return (
    <>
      Additional Market Data
    </>
  )
}