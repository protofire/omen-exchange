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

const AdditionalMarketDataSectionWrapper = styled.a`
  display: flex;
  align-items: center;
  margin-left: 20px;
  cursor: pointer;
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
  showingTradeHistory: boolean
  handleTradeHistoryClick: () => void
}

export const AdditionalMarketData: React.FC<Props> = props => {
  const { arbitrator, category, handleTradeHistoryClick, id, oracle, showingTradeHistory } = props

  const windowObj: any = window
  const realitioBaseUrl =
    windowObj.ethereum && windowObj.ethereum.isMetaMask ? 'https://reality.eth' : 'https://reality.eth.link'

  const realitioUrl = id ? `${realitioBaseUrl}/app/#!/question/${id}` : `${realitioBaseUrl}/`

  return (
    <AdditionalMarketDataWrapper>
      <AdditionalMarketDataLeft>
        <AdditionalMarketDataSectionWrapper href={`/#/24h-volume/category/${encodeURI(category)}`}>
          <IconCategory></IconCategory>
          <AdditionalMarketDataSectionTitle>{category}</AdditionalMarketDataSectionTitle>
        </AdditionalMarketDataSectionWrapper>
        <AdditionalMarketDataSectionWrapper href={realitioUrl} rel="noopener noreferrer" target="_blank">
          <IconOracle></IconOracle>
          <AdditionalMarketDataSectionTitle>{oracle}</AdditionalMarketDataSectionTitle>
        </AdditionalMarketDataSectionWrapper>
        <AdditionalMarketDataSectionWrapper href={arbitrator.url} rel="noopener noreferrer" target="_blank">
          <IconArbitrator></IconArbitrator>
          <AdditionalMarketDataSectionTitle>{arbitrator.name}</AdditionalMarketDataSectionTitle>
        </AdditionalMarketDataSectionWrapper>
      </AdditionalMarketDataLeft>
      <AdditionalMarketDataRight>
        <AdditionalMarketDataSectionWrapper onClick={handleTradeHistoryClick}>
          <AdditionalMarketDataSectionTitle>Trade History</AdditionalMarketDataSectionTitle>
          {showingTradeHistory ? <IconChevronUp></IconChevronUp> : <IconChevronDown></IconChevronDown>}
        </AdditionalMarketDataSectionWrapper>
      </AdditionalMarketDataRight>
    </AdditionalMarketDataWrapper>
  )
}
