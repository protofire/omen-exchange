import React, { DOMAttributes, useEffect, useState } from 'react'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'

import { useConnectedWeb3Context } from '../../../../hooks'
import { useRealityLink } from '../../../../hooks/useRealityLink'
import { CompoundService } from '../../../../services/compound_service'
import { Arbitrator, CompoundTokenType, KlerosItemStatus, KlerosSubmission, Token } from '../../../../util/types'
import { IconAlert, IconArbitrator, IconCategory, IconOracle, IconVerified } from '../../../common/icons'
import { CompoundIconNoBorder } from '../../../common/icons/currencies/CompoundIconNoBorder'

const AdditionalMarketDataWrapper = styled.div`
  border-top: ${({ theme }) => theme.borders.borderLineDisabled};
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-left: -25px;
  width: ${props => props.theme.mainContainer.maxWidth};

  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    flex-direction: column;
    width: calc(100% + 25px * 2);
    height: auto;
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
    flex-wrap: wrap !important;
    width: 100%;
    padding: 14px 24px;
    padding-bottom: 4px;
    & > * {
      margin: 0 !important;
      margin-right: 22px !important;
      margin-bottom: 10px !important;
    }
  }
`

const CompoundInterestWrapper = styled.div`
  color: ${props => props.theme.colors.compound};
  margin-left: 8px;
`

const AdditionalMarketDataSectionTitle = styled.p<{ isError?: boolean }>`
  margin: 0;
  margin-left: 8px;
  font-size: ${props => props.theme.textfield.fontSize};
  line-height: 16px;
  white-space: nowrap;
  color: ${({ isError, theme }) => (isError ? theme.colors.alert : theme.colors.clickable)};
  &:first-letter {
    text-transform: capitalize;
  }
`

const AdditionalMarketDataSectionWrapper = styled.a<{ noColorChange?: boolean; isError?: boolean }>`
  display: flex;
  align-items: center;
  cursor: pointer;

  &:hover {
    p {
      color: ${props => (props.isError ? props.theme.colors.alertHover : props.theme.colors.primaryLight)};
    }
    svg {
      circle {
        stroke: ${props => props.theme.colors.primaryLight};
      }
      path {
        fill: ${props =>
          props.noColorChange ? '' : props.isError ? props.theme.colors.alertHover : props.theme.colors.primaryLight};
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

interface Props extends DOMAttributes<HTMLDivElement> {
  category: string
  arbitrator: Arbitrator
  collateral: Token
  oracle: string
  id: string
  curatedByDxDaoOrKleros: boolean
  curatedByDxDao: boolean
  submissionIDs: KlerosSubmission[]
  ovmAddress: string
  title: string
  address: string
}

export const AdditionalMarketData: React.FC<Props> = props => {
  const { address, arbitrator, category, collateral, curatedByDxDaoOrKleros, id, oracle, submissionIDs, title } = props
  const realitioBaseUrl = useRealityLink()
  const realitioUrl = id ? `${realitioBaseUrl}/app/#!/question/${id}` : `${realitioBaseUrl}/`
  const context = useConnectedWeb3Context()
  const { account, library: provider } = context
  submissionIDs.sort((s1, s2) => {
    if (s1.status === KlerosItemStatus.Registered) return -1
    if (s2.status === KlerosItemStatus.Registered) return 1
    if (s1.status === KlerosItemStatus.ClearingRequested) return -1
    if (s2.status === KlerosItemStatus.ClearingRequested) return 1
    if (s1.status === KlerosItemStatus.RegistrationRequested) return -1
    if (s2.status === KlerosItemStatus.RegistrationRequested) return 1
    return 0
  })

  const queryParams = new URLSearchParams()
  queryParams.append('col1', title)
  queryParams.append('col2', `https://omen.eth.link/#/${address}`)

  const [compoundInterestRate, setCompoundInterestRate] = useState<string>('-')

  useEffect(() => {
    const getAPY = async () => {
      const compoundServiceObject = new CompoundService(collateral.address, collateral.symbol, provider, account)
      const supplyRate = await compoundServiceObject.calculateSupplyRateAPY()
      setCompoundInterestRate(supplyRate.toFixed(2))
    }
    if (collateral.symbol.toLowerCase() in CompoundTokenType) {
      getAPY()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <AdditionalMarketDataWrapper>
      <AdditionalMarketDataLeft>
        <AdditionalMarketDataSectionWrapper href={`/#/24h-volume/category/${encodeURI(category)}`} noColorChange={true}>
          <IconCategory size={'24'} />
          <AdditionalMarketDataSectionTitle>{category}</AdditionalMarketDataSectionTitle>
        </AdditionalMarketDataSectionWrapper>
        <AdditionalMarketDataSectionWrapper
          data-arrow-color="transparent"
          data-tip={`This market uses the ${oracle} oracle which crowd-sources the correct outcome.`}
          href={realitioUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <IconOracle size={'24'} />
          <AdditionalMarketDataSectionTitle>{oracle}</AdditionalMarketDataSectionTitle>
        </AdditionalMarketDataSectionWrapper>
        <AdditionalMarketDataSectionWrapper
          data-arrow-color="transparent"
          data-tip={`This market uses ${arbitrator.name} as the final arbitrator.`}
          href={arbitrator.url}
          rel="noopener noreferrer"
          target="_blank"
        >
          <IconArbitrator size={'24'} />
          <AdditionalMarketDataSectionTitle>{arbitrator.name}</AdditionalMarketDataSectionTitle>
        </AdditionalMarketDataSectionWrapper>
        <AdditionalMarketDataSectionWrapper
          data-arrow-color="transparent"
          data-tip={
            curatedByDxDaoOrKleros
              ? 'This Market is verified by DXdao or Kleros and therefore valid.'
              : 'This Market has not been verified and may be invalid.'
          }
          isError={!curatedByDxDaoOrKleros}
        >
          {curatedByDxDaoOrKleros ? <IconVerified size={'24'} /> : <IconAlert size={'24'} />}
          <AdditionalMarketDataSectionTitle isError={!curatedByDxDaoOrKleros}>
            {curatedByDxDaoOrKleros ? 'Verified' : 'Not Verified'}
          </AdditionalMarketDataSectionTitle>
        </AdditionalMarketDataSectionWrapper>
        {collateral.symbol.toLowerCase() in CompoundTokenType ? (
          <AdditionalMarketDataSectionWrapper
            data-tip={`This market is earning ${compoundInterestRate}% APY powered by compound.finance`}
          >
            <CompoundIconNoBorder />
            <CompoundInterestWrapper>{compoundInterestRate}% APY</CompoundInterestWrapper>
          </AdditionalMarketDataSectionWrapper>
        ) : (
          <span />
        )}
      </AdditionalMarketDataLeft>
      <ReactTooltip
        className="customMarketTooltip"
        data-multiline={true}
        effect="solid"
        offset={{ top: 0 }}
        place="top"
        type="light"
      />
    </AdditionalMarketDataWrapper>
  )
}
