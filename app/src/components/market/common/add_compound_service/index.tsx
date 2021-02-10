import React from 'react'
import styled from 'styled-components'

import { getCTokenForToken } from '../../../../util/tools'
import { IconTick } from '../../../common/icons'
import { CompoundIcon } from '../../../common/icons/currencies/CompoundIcon'

const Wrapper = styled.div`
  border-radius: 4px;
  border: ${({ theme }) => theme.borders.borderLineDisabled};
  padding: 18px 25px;
  margin-bottom: 20px;
`

const Title = styled.h2`
  color: ${props => props.theme.colors.textColorDark};
  font-size: 16px;
  letter-spacing: 0.4px;
  line-height: 1.2;
  margin: 0 0 20px;
  font-weight: 400;
`

const DescriptionWrapper = styled.div`
  align-items: center;
  display: flex;
`

const CheckService = styled.div<{ isServiceChecked: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  text-align: center;
  border: 1px solid ${props => (props.isServiceChecked ? props.theme.colors.transparent : props.theme.colors.tertiary)};
  background-color: ${props =>
    props.isServiceChecked ? props.theme.colors.clickable : props.theme.colors.mainBodyBackground};
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    border: 1px solid ${props => (props.isServiceChecked ? 'none' : props.theme.colors.tertiaryDark)};
    cursor: pointer;
  }
  &:active {
    border: 1px solid ${props => (props.isServiceChecked ? 'none' : props.theme.colors.tertiaryDark)};
  }
  path {
    fill: ${props =>
      props.isServiceChecked ? props.theme.colors.mainBodyBackground : props.theme.textfield.textColorDark};
  }
`

const ServiceWrapper = styled.div`
  color: ${props => props.theme.colors.textColorLightish};
  font-size: ${props => props.theme.textfield.fontSize};
  letter-spacing: 0.2px;
  line-height: 1.4;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-box-pack: justify;
`

const ServiceIconWrapper = styled.div`
  display: flex;
  padding-right: 16px;
  text-align: center;
  -webkit-box-align: center;
`

const ServiceTextWrapper = styled.div`
  width: 90%;
`

const ServiceCheckWrapper = styled.div`
  justify-content: space-between;
  color: transparent;
`

const CompoundServiceDescription = styled.div`
  color: ${props => props.theme.colors.textColorLightish};
  font-size: ${props => props.theme.textfield.fontSize};
  letter-spacing: 0.2px;
  line-height: 1.4;
  margin: 0;
  width: 100%;
`

const ServiceTokenDetails = styled.div`
  width: 100%;
  display: flex;
`

const TextHeading = styled.div`
  color: ${props => props.theme.colors.textColorDark};
  width: 71px;
  height: 16px;
  left: 54px;
  top: calc(50% - 16px / 2 - 11px);
  font-weight: 500;
  font-size: 14px;
  line-height: 16px;
  display: flex;
  align-items: center;
  letter-spacing: 0.2px;
  margin: 0px 6px 0px 0px;
`

const TextBody = styled.div`
  line-height: 16px;
  font-size: 14px;
  height: 16px;
  margin: 6px 6px 0px 0px;
`

const TextBodyMarker = styled.span`
  color: ${props => props.theme.colors.green};
  font-weight: 500;
`

export interface AddCompoundServiceProps {
  isServiceChecked: boolean
  toggleServiceCheck?: any
  compoundInterestRate: string
  currentToken: string
}

export const AddCompoundService: React.FC<AddCompoundServiceProps> = (props: AddCompoundServiceProps) => {
  const { compoundInterestRate, currentToken, isServiceChecked, toggleServiceCheck } = props
  let serviceChecked = <IconTick selected={true} />
  if (!isServiceChecked) {
    serviceChecked = <IconTick selected={false} />
  }
  const cTokenSymbol = getCTokenForToken(currentToken)
  const currentTokenDisplay = currentToken.charAt(0).toUpperCase() + currentToken.slice(1).toLowerCase()
  const cTokenDisplay =
    cTokenSymbol.charAt(0).toLowerCase() + cTokenSymbol.charAt(1).toUpperCase() + cTokenSymbol.slice(2).toLowerCase()
  return (
    <Wrapper>
      <Title>Recommended Service</Title>
      <DescriptionWrapper>
        <CompoundServiceDescription>
          <ServiceWrapper>
            <ServiceIconWrapper>
              <CompoundIcon />
            </ServiceIconWrapper>
            <ServiceTokenDetails>
              <ServiceTextWrapper>
                <TextHeading>Compound</TextHeading>
                <TextBody>
                  Convert {currentTokenDisplay} to {cTokenDisplay} and
                  <TextBodyMarker> earn {compoundInterestRate}% APY</TextBodyMarker>
                </TextBody>
              </ServiceTextWrapper>
              <ServiceCheckWrapper onClick={toggleServiceCheck}>
                <CheckService isServiceChecked={isServiceChecked}>{serviceChecked}</CheckService>
              </ServiceCheckWrapper>
            </ServiceTokenDetails>
          </ServiceWrapper>
        </CompoundServiceDescription>
      </DescriptionWrapper>
    </Wrapper>
  )
}
