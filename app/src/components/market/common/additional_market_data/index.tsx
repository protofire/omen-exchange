import React, { DOMAttributes } from 'react'
import styled from 'styled-components'

import { IconCategory } from '../../../common/icons/IconCategory'
import { IconOracle } from '../../../common/icons/IconOracle'
import { IconArbitrator } from '../../../common/icons/IconArbitrator'
import { IconChevronDown } from '../../../common/icons/IconChevronDown'

const AdditionalMarketDataWrapper = styled.div`
  height: 45px;
  border-top: 1px solid ${props => props.theme.borders.borderColorLighter};
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-left: -26px;
  width: ${props => props.theme.mainContainer.maxWidth};
  padding: 0 6px;
`

const AdditionalMarketDataLeft = styled.div`
  display: flex;
  align-items: center;
`

const AdditionalMarketDataRight = styled.div`
  display: flex;
  align-items: center;
  margin-right: 20px;
`

const AdditionalMarketDataSectionWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: 20px;
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
      <AdditionalMarketDataRight>
        <AdditionalMarketDataSectionWrapper>
          <AdditionalMarketDataSectionTitle>
            Trade History
          </AdditionalMarketDataSectionTitle>
          <IconChevronDown></IconChevronDown>
        </AdditionalMarketDataSectionWrapper>
      </AdditionalMarketDataRight>
    </AdditionalMarketDataWrapper>
  )
}