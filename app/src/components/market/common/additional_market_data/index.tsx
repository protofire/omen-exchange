import React, { DOMAttributes } from 'react'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'

import { useRealityLink } from '../../../../hooks/useRealityLink'
import { Arbitrator } from '../../../../util/types'
import { IconAlert } from '../../../common/icons/IconAlert'
import { IconArbitrator } from '../../../common/icons/IconArbitrator'
import { IconCategory } from '../../../common/icons/IconCategory'
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

const AdditionalMarketDataSectionWrapper = styled.a<{ noColorChange?: boolean }>`
  display: flex;
  align-items: center;
  margin-left: 16px;
  cursor: pointer;

  &:hover {
    p {
      color: ${props => props.theme.colors.primaryLight};
    }
    svg {
      circle {
        stroke: ${props => props.theme.colors.primaryLight};
      }
      path {
        fill: ${props => (props.noColorChange ? '' : props.theme.colors.primaryLight)};
      }

      path:nth-child(even) {
        fill: ${props => props.theme.colors.primaryLight};
      }
    }
  }
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
  const realitioBaseUrl = useRealityLink()

  const realitioUrl = id ? `${realitioBaseUrl}/app/#!/question/${id}` : `${realitioBaseUrl}/`

  const isMobile = window.innerWidth < 768

  return (
    <AdditionalMarketDataWrapper>
      <AdditionalMarketDataLeft>
        <AdditionalMarketDataSectionWrapper href={`/#/24h-volume/category/${encodeURI(category)}`} noColorChange={true}>
          <IconCategory size={isMobile ? '20' : '24'} />
          <AdditionalMarketDataSectionTitle>{category}</AdditionalMarketDataSectionTitle>
        </AdditionalMarketDataSectionWrapper>
        <AdditionalMarketDataSectionWrapper
          data-arrow-color="transparent"
          data-tip={`This market uses the ${oracle} oracle which crowd-sources the correct outcome.`}
          href={realitioUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <IconOracle size={isMobile ? '20' : '24'} />
          <AdditionalMarketDataSectionTitle>{oracle}</AdditionalMarketDataSectionTitle>
        </AdditionalMarketDataSectionWrapper>
        <AdditionalMarketDataSectionWrapper
          data-arrow-color="transparent"
          data-tip={`This market uses ${arbitrator.name} as the final arbitrator.`}
          href={arbitrator.url}
          rel="noopener noreferrer"
          target="_blank"
        >
          <IconArbitrator size={isMobile ? '20' : '24'} />
          <AdditionalMarketDataSectionTitle>{arbitrator.name}</AdditionalMarketDataSectionTitle>
        </AdditionalMarketDataSectionWrapper>
        <AdditionalMarketDataSectionWrapper>
          {verified ? <IconVerified size={isMobile ? '20' : '24'} /> : <IconAlert size={isMobile ? '20' : '24'} />}
          <AdditionalMarketDataSectionTitle verified={!verified}>
            {verified ? 'Verified' : 'Not verified'}
          </AdditionalMarketDataSectionTitle>
        </AdditionalMarketDataSectionWrapper>
      </AdditionalMarketDataLeft>
      <ReactTooltip
        className="customMarketTooltip"
        data-multiline={true}
        effect="solid"
        offset={{ top: -12 }}
        place="top"
        type="light"
      />
    </AdditionalMarketDataWrapper>
  )
}
