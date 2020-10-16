import React, { DOMAttributes } from 'react'
import styled from 'styled-components'

import { Arbitrator } from '../../../../util/types'
import { IconArbitrator } from '../../../common/icons/IconArbitrator'
import { IconCategory } from '../../../common/icons/IconCategory'
import { IconExclamation } from '../../../common/icons/IconNotVerifiedExclamation'
import { IconOracle } from '../../../common/icons/IconOracle'
import { IconVerified } from '../../../common/icons/IconVerified'
const AdditionalMarketDataWrapper = styled.div`
  height: 45px;
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
`

const AdditionalMarketDataSectionWrapper = styled.a`
  display: flex;
  align-items: center;
  margin-left: 16px;
  cursor: pointer;

  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    margin-left: 11px;
    &:nth-of-type(1) {
      margin-left: 0;
    }
  }
`

const AdditionalMarketDataSectionTitle = styled.p<{ verified?: boolean }>`
  margin-left: 6px;
  font-size: 14px;
  line-height: 16px;
  color: ${props => (props.verified ? props.theme.colors.danger : props.theme.colors.clickable)};
  &:first-letter {
    text-transform: capitalize;
  }
`

interface Props extends DOMAttributes<HTMLDivElement> {
  category: string
  arbitrator: Arbitrator
  oracle: string
  id: string
  verified?: boolean | number
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
        <AdditionalMarketDataSectionWrapper>
          {verified ? (
            <IconVerified size={isMobile ? '20' : '24'} />
          ) : (
            <IconExclamation size={isMobile ? '20' : '24'} />
          )}
          <AdditionalMarketDataSectionTitle verified={!verified}>
            {verified ? 'Verified' : 'Not verified'}
          </AdditionalMarketDataSectionTitle>
        </AdditionalMarketDataSectionWrapper>
      </AdditionalMarketDataLeft>
    </AdditionalMarketDataWrapper>
  )
}
// export const AdditionalMarketData = withRouter(AdditionalMarketDatas)
