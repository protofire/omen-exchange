import React, { DOMAttributes } from 'react'
import styled from 'styled-components'

import { Arbitrator } from '../../../../util/types'
import { IconAlert, IconArbitrator, IconCategory, IconOracle, IconVerified } from '../../../common/icons'

const AdditionalMarketDataWrapper = styled.div`
  border-top: 1px solid ${props => props.theme.borders.borderDisabled};
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
  padding: 14px 20px;

  & > * + * {
    margin-left: 14px;
  }
  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    flex-wrap: wrap;
    justify-content: space-between;
    & > * {
      margin: 0;
      width: 45%;
      margin-top: 5px;
    }
  }
`

const AdditionalMarketDataSectionWrapper = styled.a`
  display: flex;
  align-items: center;
  cursor: pointer;
`

const AdditionalMarketDataSectionDivWrapper = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`

const AdditionalMarketDataSectionTitle = styled.p<{ isError?: boolean }>`
  margin: 0;
  margin-left: 8px;
  font-size: 14px;
  line-height: 16px;
  white-space: nowrap;
  color: ${({ isError, theme }) => (isError ? theme.colors.alert : theme.colors.clickable)};
  &:first-letter {
    text-transform: capitalize;
  }
`

interface Props extends DOMAttributes<HTMLDivElement> {
  category: string
  arbitrator: Arbitrator
  oracle: string
  id: string
  verified: boolean
}

export const AdditionalMarketData: React.FC<Props> = props => {
  const { arbitrator, category, id, oracle, verified } = props

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
        <AdditionalMarketDataSectionDivWrapper>
          {verified ? <IconVerified size={isMobile ? '20' : '24'} /> : <IconAlert size={isMobile ? '20' : '24'} />}
          <AdditionalMarketDataSectionTitle isError={!verified}>
            {verified ? 'Verified' : 'Not Verified'}
          </AdditionalMarketDataSectionTitle>
        </AdditionalMarketDataSectionDivWrapper>
      </AdditionalMarketDataLeft>
    </AdditionalMarketDataWrapper>
  )
}
