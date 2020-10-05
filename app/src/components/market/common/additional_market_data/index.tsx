import React, { DOMAttributes } from 'react'
import styled from 'styled-components'

import { Arbitrator } from '../../../../util/types'
import { IconArbitrator } from '../../../common/icons/IconArbitrator'
import { IconCategory } from '../../../common/icons/IconCategory'
import { IconChevronDown } from '../../../common/icons/IconChevronDown'
import { IconChevronUp } from '../../../common/icons/IconChevronUp'
import { IconOracle } from '../../../common/icons/IconOracle'

const AdditionalMarketDataWrapper = styled.div`
  height: 45px;
  border-top: 1px solid ${props => props.theme.borders.borderColorLighter};
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-left: -26px;
  width: ${props => props.theme.mainContainer.maxWidth};
  padding: 0 6px;

  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    flex-direction: column;
    width: calc(100% + 26px * 2);
    height: auto;
    border-top: none;
  }
`

const AdditionalMarketDataLeft = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 10px;
`

const AdditionalMarketDataSectionWrapper = styled.a`
  display: flex;
  align-items: center;
  margin-left: 20px;
  cursor: pointer;

  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    margin-left: 11px;
    &:nth-of-type(1) {
      margin-left: 0;
    }
  }
`

const AdditionalMarketDataSectionTitle = styled.p`
  margin-left: 6px;
  font-size: 14px;
  line-height: 16px;
  color: ${props => props.theme.colors.clickable};
`

interface Props extends DOMAttributes<HTMLDivElement> {
  category: string
  arbitrator: Arbitrator
  oracle: string
  id: string
}

export const AdditionalMarketData: React.FC<Props> = props => {
  const { arbitrator, category, id, oracle } = props

  const windowObj: any = window
  const realitioBaseUrl =
    windowObj.ethereum && windowObj.ethereum.isMetaMask ? 'https://reality.eth' : 'https://reality.eth.link'

  const realitioUrl = id ? `${realitioBaseUrl}/app/#!/question/${id}` : `${realitioBaseUrl}/`

  const isMobile = window.innerWidth < 768

  return (
    <AdditionalMarketDataWrapper>
      <AdditionalMarketDataLeft>
        <AdditionalMarketDataSectionWrapper href={`/#/24h-volume/category/${encodeURI(category)}`}>
          <IconCategory size={isMobile ? '20' : '24'} />
          <AdditionalMarketDataSectionTitle>{category}</AdditionalMarketDataSectionTitle>
        </AdditionalMarketDataSectionWrapper>
        <AdditionalMarketDataSectionWrapper href={realitioUrl} rel="noopener noreferrer" target="_blank">
          <IconOracle size={isMobile ? '20' : '24'} />
          <AdditionalMarketDataSectionTitle>{oracle}</AdditionalMarketDataSectionTitle>
        </AdditionalMarketDataSectionWrapper>
        <AdditionalMarketDataSectionWrapper href={arbitrator.url} rel="noopener noreferrer" target="_blank">
          <IconArbitrator size={isMobile ? '20' : '24'} />
          <AdditionalMarketDataSectionTitle>{arbitrator.name}</AdditionalMarketDataSectionTitle>
        </AdditionalMarketDataSectionWrapper>
      </AdditionalMarketDataLeft>
    </AdditionalMarketDataWrapper>
  )
}
