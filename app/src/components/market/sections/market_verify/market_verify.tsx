import React, { ChangeEvent, useCallback, useState } from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { ConnectedWeb3Context } from '../../../../hooks'
import { useKlerosCuration } from '../../../../hooks/useKlerosCuration'
import { MarketMakerData } from '../../../../util/types'
import { Button } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import { SubsectionTitle, SubsectionTitleWrapper } from '../../../common'
import { InlineLoading } from '../../../loading'

import { DxDaoCuration } from './option/dxdao_curation'
import { KlerosCuration } from './option/kleros_curation'

const BottomRow = styled.div`
  border-top: 1px solid ${props => props.theme.borders.borderColorLighter};
  margin: 0 -25px;
  padding: 20px 25px 0;
`

const RightButton = styled(Button)`
  margin-left: auto;
`

export const CurationRow = styled.div`
  border-top: 1px solid ${props => props.theme.borders.borderColorLighter};
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
`

export const CurationRadioTick = styled.img<StatefulRadioButton>`
  filter: ${props => (props.selected ? 'saturate(0) brightness(2)' : 'saturate(0) brightness(1.6)')};

  ${CurationSubRow}:hover & {
    filter: ${props => !props.selected && 'none'};
  }
`

export const CurationOption = styled.div`
  color: ${props => props.theme.colors.textColorDarker};
  font-weight: 500;
`

export const CurationOptionDetails = styled.div`
  color: ${props => props.theme.colors.textColorLighter};
`

const UnstyledLink = styled.a`
  color: inherit;
`

interface StatefulRadioButton {
  selected?: boolean
}

interface Props extends RouteComponentProps<any> {
  marketMakerData: MarketMakerData
  context: ConnectedWeb3Context
}

const MarketVerifyWrapper: React.FC<Props> = (props: Props) => {
  const { context, marketMakerData } = props || {}
  const [selection, setSelection] = useState<number | undefined>()
  const klerosCurationData = useKlerosCuration(marketMakerData, context)

  const selectSource = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget
    setSelection(Number(value))
  }, [])

  const { ovmAddress } = klerosCurationData || {}
  const { address, question } = marketMakerData || {}
  const { title } = question || {}
  let requestVerificationLink = 'https://dxdao.eth.link/#/'
  if (selection === 0) {
    const queryParams = new URLSearchParams()
    queryParams.append('col1', title)
    queryParams.append('col2', `https://omen.eth.link/#/${address}`)
    requestVerificationLink = `https://curate.kleros.io/tcr/${ovmAddress}/addItem?${queryParams.toString()}`
  }

  if (!klerosCurationData) return <InlineLoading />

  return (
    <>
      <SubsectionTitleWrapper>
        <SubsectionTitle>Verify</SubsectionTitle>
      </SubsectionTitleWrapper>
      <KlerosCuration klerosCurationData={klerosCurationData} selectSource={selectSource} selection={selection} />
      <DxDaoCuration selectSource={selectSource} selection={selection} />
      <BottomRow>
        <RightButton buttonType={ButtonType.primaryLine} disabled={typeof selection !== 'number'}>
          <UnstyledLink href={requestVerificationLink} rel="noopener noreferrer" target="_blank">
            Request Verification
          </UnstyledLink>
        </RightButton>
      </BottomRow>
    </>
  )
}

export const MarketVerify = withRouter(MarketVerifyWrapper)
