import React from 'react'
import styled, { css } from 'styled-components'
import Icon from './img/icon.svg'
import { useConnectedWeb3Context } from '../../../hooks/connectedWeb3'
import { truncateStringInTheMiddle } from '../../../util/tools'
import { getContractAddressName } from '../../../util/networks'

const NetworkWrapper = styled.div`
  align-items: flex-end;
  display: flex;
  flex-direction: column;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    align-items: center;
    flex-direction: row;
  }
`

const NetworkContainer = styled.div``

const IconStyled = styled.img`
  height: 13px;
  margin: 0 8px 0 0;
  width: 13px;
`

const Separator = css`
  &::before {
    background-color: ${props => props.theme.header.color};
    content: '';
    height: 22px;
    margin: 0 15px;
    width: 1px;
  }
`

const NetworkName = styled.span`
  color: ${props => props.theme.header.color};
  font-size: 14px;
  font-weight: 400;
`

const ConnectionStatusWrapper = styled.div`
  align-items: center;
  display: flex;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    ${Separator}
  }
`

const ConnectionStatusText = styled.span`
  color: ${props => props.theme.header.color};
  font-size: 14px;
  font-weight: 400;
`

const ConnectionStatusDot = styled.div`
  background-color: #55bc65;
  border-radius: 50%;
  height: 12px;
  margin-right: 8px;
  width: 12px;
`

export const Network: React.FC = props => {
  const context = useConnectedWeb3Context()
  const { account, networkId } = context
  const networkName = getContractAddressName(networkId)
  const { ...restProps } = props

  if (!account) {
    return null
  }
  return (
    <NetworkWrapper {...restProps}>
      <NetworkContainer>
        <IconStyled src={Icon} alt="" />
        {networkName ? <NetworkName>{networkName}</NetworkName> : null}
      </NetworkContainer>
      <ConnectionStatusWrapper>
        <ConnectionStatusDot />
        <ConnectionStatusText>
          {truncateStringInTheMiddle(account, 6, 4) || 'No account connected'}
        </ConnectionStatusText>
      </ConnectionStatusWrapper>
    </NetworkWrapper>
  )
}
