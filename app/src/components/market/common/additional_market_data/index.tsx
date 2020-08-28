import React, { DOMAttributes } from 'react'
import styled from 'styled-components'

import { IconCategory } from '../../../common/icons/IconCategory'
import { IconOracle } from '../../../common/icons/IconOracle'
import { IconArbitrator } from '../../../common/icons/IconArbitrator'
import { IconChevronDown } from '../../../common/icons/IconChevronDown'
import { IconChevronUp } from '../../../common/icons/IconChevronUp'
import { Arbitrator } from '../../../../util/types'

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

const AdditionalMarketDataSectionTitle = styled.a`
  margin-left: 6px;
  font-size: 14px;
  line-height: 16px;
  color: ${props => props.theme.colors.clickable}
  cursor: pointer;
`

interface Props extends DOMAttributes<HTMLDivElement> {
  category: string
  arbitrator: Arbitrator
  oracle: string
  id: string
  showingTradeHistory: boolean
  handleTradeHistoryClick: () => void
}

export const AdditionalMarketData: React.FC<Props> = props => {
  const { category, arbitrator, oracle, id, showingTradeHistory, handleTradeHistoryClick } = props

  const windowObj: any = window
  const realitioBaseUrl =
    windowObj.ethereum && windowObj.ethereum.isMetaMask ? 'https://reality.eth' : 'https://reality.eth.link'

  const realitioUrl = id ? `${realitioBaseUrl}/app/#!/question/${id}` : `${realitioBaseUrl}/`

  return (
    <AdditionalMarketDataWrapper>
      <AdditionalMarketDataLeft>
        <AdditionalMarketDataSectionWrapper>
          <IconCategory></IconCategory>
          <AdditionalMarketDataSectionTitle href={`/#/24h-volume/category/${encodeURI(category)}`}>
            {category}
          </AdditionalMarketDataSectionTitle>
        </AdditionalMarketDataSectionWrapper>
        <AdditionalMarketDataSectionWrapper>
          <IconOracle></IconOracle>
          <AdditionalMarketDataSectionTitle href={realitioUrl} target="_blank" rel="noopener noreferrer">
            {oracle}
          </AdditionalMarketDataSectionTitle>
        </AdditionalMarketDataSectionWrapper>
        <AdditionalMarketDataSectionWrapper>
          <IconArbitrator></IconArbitrator>
          <AdditionalMarketDataSectionTitle href={arbitrator.url} target="_blank" rel="noopener noreferrer">
            {arbitrator.name}
          </AdditionalMarketDataSectionTitle>
        </AdditionalMarketDataSectionWrapper>
      </AdditionalMarketDataLeft>
      <AdditionalMarketDataRight>
        <AdditionalMarketDataSectionWrapper>
          <AdditionalMarketDataSectionTitle onClick={handleTradeHistoryClick}>
            Trade History
          </AdditionalMarketDataSectionTitle>
          {showingTradeHistory ? (
            <IconChevronUp></IconChevronUp>
          ) : (
            <IconChevronDown></IconChevronDown>
          )}
        </AdditionalMarketDataSectionWrapper>
      </AdditionalMarketDataRight>
    </AdditionalMarketDataWrapper>
  )
}