import { BigNumber } from 'ethers/utils'
import React, { HTMLAttributes, useState } from 'react'
import Modal from 'react-modal'
import styled, { withTheme } from 'styled-components'

import { useAirdropService } from '../../../hooks'
import { Button } from '../../button'
import { ButtonType } from '../../button/button_styling_types'
import { FormLabel, Textfield } from '../../common'
import { IconArrowBack, IconClose } from '../../common/icons'
import { ContentWrapper, ModalNavigation, ModalNavigationLeft, ModalTitle } from '../common_styled'

import { AirdropCardWrapper } from './airdrop_card'

const ClaimButton = styled(Button)`
  width: 100%;
`

const RecipientWrapper = styled.div`
  width: 100%;
  margin: 24px 0px;
`

const RecipientLabel = styled(FormLabel)`
  display: inline-block;
  margin-bottom: 12px;
`

const AddressField = styled(Textfield)<{ error: boolean }>`
  border-color: ${props => (props.error ? props.theme.colors.alert : props.theme.textfield.borderColor)};
  &:hover {
    border-color: ${props => (props.error ? props.theme.colors.alert : props.theme.textfield.borderColorOnHover)};
  }

  &:active,
  &:focus {
    border-color: ${props => (props.error ? props.theme.colors.alert : props.theme.textfield.borderColorActive)};
  }
`

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.alert};
  margin-top: 12px;
  font-size: ${props => props.theme.fonts.defaultSize};
  line-height: 16px;
  letter-spacing: 0.2px;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  claim?: (account: string, amount: BigNumber) => Promise<void>
  onClose: () => void
  onBack?: () => void
  theme?: any
}

export const ModalCheckAddress = (props: Props) => {
  const { claim, isOpen, onBack, onClose, theme } = props

  const { airdrop } = useAirdropService()

  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState(new BigNumber('0'))
  const [loading, setLoading] = useState(false)

  const updateAddress = async (e: any) => {
    const newAddress = e.target.value
    setAddress(newAddress)
    setLoading(true)
    const newAmount = await airdrop.getClaimAmount(newAddress)
    setAmount(newAmount)
    setLoading(false)
  }

  const submitClaim = async () => {
    if (claim && address) {
      await claim(address, amount)
      setAddress('')
      setAmount(new BigNumber('0'))
    }
  }

  React.useEffect(() => {
    Modal.setAppElement('#root')
  }, [])

  const error = !loading && address !== '' && amount.isZero()

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
        <RecipientWrapper>
          <RecipientLabel>Recipient</RecipientLabel>
          <AddressField error={error} onChange={updateAddress} placeholder="Wallet Address" value={address} />
          {error && <ErrorMessage>Address has no available claim</ErrorMessage>}
        </RecipientWrapper>
        <ClaimButton buttonType={ButtonType.primary} disabled={amount.isZero()} onClick={submitClaim}>
          Claim OMN
        </ClaimButton>
      </ContentWrapper>
    </Modal>
  )
}

export const ModalCheckAddressWrapper = withTheme(ModalCheckAddress)
