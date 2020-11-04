import React, { useCallback, useState } from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { ConnectedWeb3Context } from '../../../../hooks'
import { useKlerosCuration } from '../../../../hooks/useKlerosCuration'
import { MarketMakerData, Status } from '../../../../util/types'
import { ButtonContainer } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import { InlineLoading } from '../../../loading'
import { GenericError, MarketBottomNavButton } from '../../common/common_styled'

import { DxDaoCuration } from './option/dxdao_curation'
import { KlerosCuration } from './option/kleros_curation'

const CustomInlineLoading = styled(InlineLoading)`
  margin: 24px 0 35px;
`

const BottomButtonWrapper = styled(ButtonContainer)`
  justify-content: space-between;
`

const MarketVerification = styled.div`
  margin: 0 -25px;
  padding: 0 24px 0;
  border-top: ${({ theme }) => theme.borders.borderLineDisabled};
`

export const CurationRow = styled.div`
  border-bottom: ${props => props.theme.cards.border};
  margin: 0 -25px;
  padding: 20px 25px;
  position: relative;
`

export const CurationSubRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: no-wrap;
  position: relative;
`

export const CurationLeftColumn = styled.div`
  margin-right: 16px;
`

export const CurationCenterColumn = styled.div``

export const CurationRightColumn = styled.div`
  margin-left: auto;
  text-align: right;
  color: ${props => props.theme.colors.textColorDar};
  font-weight: 500;
`

export const CurationRadioTick = styled.img<StatefulRadioButton>`
  filter: ${props => (props.selected ? 'saturate(0) brightness(2)' : props.disabled ? 'saturate(0)' : '')};
  cursor: ${props => (props.disabled ? 'initial' : 'pointer')};
`

export const CurationLogoWrapper = styled.div`
  padding: 11px;
  border-radius: 50%;
  border: 1px solid ${props => props.theme.colors.tertiary};
  width: 48px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
`

export const CurationRadioWrapper = styled.div<StatefulRadioButton>`
  border-radius: 50%;
  border: 1px solid ${props => props.theme.buttonPrimaryLine.borderColorDisabled};
  cursor: ${props => (props.disabled ? 'initial' : 'pointer')};
  width: 38px;
  height: 38px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.selected && props.theme.colors.clickable};

  &:hover {
    border-color: ${props => !props.disabled && props.theme.colors.tertiary};
  }
`

export const CurationOption = styled.div`
  color: ${props => props.theme.colors.textColorDarker};
  font-weight: 500;
`

export const CurationOptionDetails = styled.div`
  color: ${props => props.theme.colors.textColorLighter};
  font-weight: 400;
`

const UnstyledLink = styled.a`
  color: inherit;
`

interface StatefulRadioButton {
  selected?: boolean
  disabled?: boolean
}

interface Props extends RouteComponentProps<any> {
  context: ConnectedWeb3Context
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: string) => void
}

const MarketVerifyWrapper: React.FC<Props> = (props: Props) => {
  const { context, marketMakerData, switchMarketTab } = props || {}
  const [selection, setSelection] = useState<number | undefined>()
  const { data, error, status } = useKlerosCuration(marketMakerData, context)

  const selectSource = useCallback(
    (value: number) => {
      if (value === selection) {
        setSelection(undefined)
      } else setSelection(value)
    },
    [selection],
  )

  const loading = status === Status.Loading && !data
  const { message: errorMessage } = error || {}
  if (!loading && errorMessage) return <GenericError>{errorMessage || 'Failed to fetch curation data'}</GenericError>

  const { ovmAddress } = data || {}
  const { address, curatedByDxDao, question } = marketMakerData || {}
  const { title } = question || {}
  let requestVerificationLink = 'https://dxdao.eth.link/#/'
  if (selection === 0) {
    const queryParams = new URLSearchParams()
    queryParams.append('col1', title)
    queryParams.append('col2', `https://omen.eth.link/#/${address}`)
    requestVerificationLink = `https://curate.kleros.io/tcr/${ovmAddress}?action=addItem&${queryParams.toString()}`
  }

  return (
    <MarketVerification>
      {loading || !data ? (
        <CurationRow>
          <CustomInlineLoading big message="Loading Curation Services" />
        </CurationRow>
      ) : (
        <>
          <KlerosCuration klerosCurationData={data} option={selection} selectSource={selectSource} />
          <DxDaoCuration curatedByDxDao={curatedByDxDao} option={selection} selectSource={selectSource} />
        </>
      )}
      <BottomButtonWrapper>
        <MarketBottomNavButton buttonType={ButtonType.secondaryLine} onClick={() => switchMarketTab('SWAP')}>
          Back
        </MarketBottomNavButton>
        <MarketBottomNavButton
          buttonType={ButtonType.primaryAlternative}
          disabled={loading || typeof selection !== 'number'}
        >
          <UnstyledLink href={requestVerificationLink} rel="noopener noreferrer" target="_blank">
            Request Verification
          </UnstyledLink>
        </MarketBottomNavButton>
      </BottomButtonWrapper>
    </MarketVerification>
  )
}

export const MarketVerify = withRouter(MarketVerifyWrapper)
