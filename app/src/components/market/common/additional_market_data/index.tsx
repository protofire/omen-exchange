import React, { DOMAttributes } from 'react'
import styled from 'styled-components'

import { IconCategory } from '../../../common/icons/IconCategory'
import { IconOracle } from '../../../common/icons/IconOracle'
import { IconArbitrator } from '../../../common/icons/IconArbitrator'

const AdditionalMarketDataWrapper = styled.div`
  height: 45px;
  border-top: 1px ${props => props.theme.borders.borderColorLighter};
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const AdditionalMarketDataLeft = styled.div`
  display: flex;
  align-items: center;
`

const AdditionalMarketDataSectionWrapper = styled.div`
  display: flex;
  align-items: center;
`

const AdditionalMarketDataSectionTitle = styled.p`
  margin-left: 6px;
  font-size: 14px;
  line-height: 16px;
  color: ${props => props.theme.colors.clickable}
`

interface Props extends DOMAttributes<HTMLDivElement> {
  category: string
  arbitrator: string
  oracle: string
}

export const AdditionalMarketData: React.FC<Props> = props => {
  const { category, arbitrator, oracle } = props

  return (
    <AdditionalMarketDataWrapper>
      <AdditionalMarketDataLeft>
        <AdditionalMarketDataSectionWrapper>
          <IconCategory></IconCategory>
          <AdditionalMarketDataSectionTitle>
            {category}
          </AdditionalMarketDataSectionTitle>
        </AdditionalMarketDataSectionWrapper>
        <AdditionalMarketDataSectionWrapper>
          <IconOracle></IconOracle>
          <AdditionalMarketDataSectionTitle>
            {oracle}
          </AdditionalMarketDataSectionTitle>
        </AdditionalMarketDataSectionWrapper>
        <AdditionalMarketDataSectionWrapper>
          <IconArbitrator></IconArbitrator>
          <AdditionalMarketDataSectionTitle>
            {arbitrator}
          </AdditionalMarketDataSectionTitle>
        </AdditionalMarketDataSectionWrapper>
      </AdditionalMarketDataLeft>
    </AdditionalMarketDataWrapper>
  )
}