import React from 'react'
import styled from 'styled-components'

import { Button } from '../../button/button'
import { ButtonType } from '../../button/button_styling_types'
import { IconClose } from '../icons'
import { DaiIcon } from '../icons/currencies'
import { Modal, ModalBackground } from '../switch_network_modal'

const ClaimAmount = styled.div`
  margin-top: 32px;
  font-size: 16px;
  color: ${props => props.theme.textfield.color};
`
const SecondaryText = styled.div`
  margin-top: 12px;
  color: ${props => props.theme.colors.textColor};
  font-size: ${props => props.theme.fonts.defaultSize};
  text-align: center;
`
const ClaimButton = styled(Button)`
  margin-top: 32px;
`
const CloseStyled = styled.div`
  align-self: flex-end;
  cursor: pointer;
  margin-bottom: 32px;
`

export const ClaimDaiModal = (props: any) => {
  return (
    <ModalBackground>
      <Modal style={{ padding: '24px 32px' }}>
        <CloseStyled
          onClick={() => {
            props.setClaim(false)
          }}
        >
          <IconClose color={'#DCDFF2'} size={'24'} />
        </CloseStyled>

        <DaiIcon size={'64'} />
        <ClaimAmount>Claim 534.22 DAI</ClaimAmount>
        <SecondaryText>
          Withdrawals from xDai Network <br /> need to be claimed
        </SecondaryText>
        <ClaimButton buttonType={ButtonType.primary} style={{ width: '252px' }}>
          Claim DAI
        </ClaimButton>
      </Modal>
    </ModalBackground>
  )
}
