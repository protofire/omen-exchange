import { BigNumber } from 'ethers/utils'
import React, { HTMLAttributes, useState } from 'react'
import Modal from 'react-modal'
import styled, { withTheme } from 'styled-components'

import { useConnectedWeb3Context } from '../../../hooks'
import { Airdrop } from '../../../services/airdrop'
import { Button } from '../../button'
import { ButtonType } from '../../button/button_styling_types'
import { FormLabel, Textfield } from '../../common'
import { IconArrowBack, IconClose } from '../../common/icons'
import { ContentWrapper, ModalNavigation, ModalNavigationLeft, ModalTitle } from '../common_styled'

import { AirdropCardWrapper } from './airdrop_card'

const ClaimButton = styled(Button)`
  width: 100%;
  margin-top: 24px;
`

const RecipientLabelWrapper = styled.div`
  width: 100%;
  margin-top: 24px;
  margin-bottom: 12px;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
  onBack?: () => void
  theme?: any
}

export const ModalCheckAddress = (props: Props) => {
  const { isOpen, onBack, onClose, theme } = props

  const { library, networkId, relay } = useConnectedWeb3Context()

  const [adddress, setAddress] = useState('')
  const [amount, setAmount] = useState(new BigNumber('0'))

  const updateAddress = (e: any) => {
    const value = e.target.value
    setAddress(value)
    setAmount(Airdrop.getClaimAmount(value, networkId, relay, library))
  }

  React.useEffect(() => {
    Modal.setAppElement('#root')
  }, [])

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} shouldCloseOnOverlayClick={true} style={theme.fluidHeightModal}>
      <ContentWrapper>
        <ModalNavigation>
          <ModalNavigationLeft>
            <IconArrowBack hoverEffect={true} onClick={onBack ? onBack : onClose} />
            <ModalTitle style={{ marginLeft: '16px' }}>Check Address</ModalTitle>
          </ModalNavigationLeft>
          <IconClose hoverEffect={true} onClick={onClose} />
        </ModalNavigation>
        <AirdropCardWrapper displayAmount={amount} displayButtons={false} />
        <RecipientLabelWrapper>
          <FormLabel>Recipient</FormLabel>
        </RecipientLabelWrapper>
        <Textfield onChange={updateAddress} placeholder="Wallet Address" value={adddress} />
        <ClaimButton buttonType={ButtonType.primaryAlternative} disabled={amount.isZero()}>
          Claim OMN
        </ClaimButton>
      </ContentWrapper>
    </Modal>
  )
}

export const ModalCheckAddressWrapper = withTheme(ModalCheckAddress)
