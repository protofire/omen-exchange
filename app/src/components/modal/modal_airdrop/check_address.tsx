import { BigNumber } from 'ethers/utils'
import React, { HTMLAttributes, useState } from 'react'
import Modal from 'react-modal'
import styled, { withTheme } from 'styled-components'

import { useAirdropService } from '../../../hooks'
import { TYPE } from '../../../theme'
import { Button } from '../../button'
import { ButtonType } from '../../button/button_styling_types'
import { Textfield } from '../../common'
import { IconArrowBack, IconClose } from '../../common/icons'
import { ContentWrapper, ModalNavigation, ModalNavigationLeft } from '../common_styled'

import { AirdropCardWrapper } from './airdrop_card'

const ClaimButton = styled(Button)`
  width: 100%;
`

const RecipientWrapper = styled.div`
  width: 100%;
  margin: 24px 0px;
`

const AddressField = styled(Textfield)<{ error: boolean }>`
  border-color: ${props => (props.error ? props.theme.red : props.theme.border1)};
  &:hover {
    border-color: ${props => (props.error ? props.theme.red : props.theme.border2)};
  }

  &:active,
  &:focus {
    border-color: ${props => (props.error ? props.theme.red : props.theme.border3)};
  }
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
            <TYPE.heading3 color={'text1'} margin={'0'} style={{ marginLeft: '16px', marginTop: '2px' }}>
              Check Address
            </TYPE.heading3>
          </ModalNavigationLeft>
          <IconClose hoverEffect={true} onClick={onClose} />
        </ModalNavigation>
        <AirdropCardWrapper displayAmount={amount} displayButtons={false} />
        <RecipientWrapper>
          <TYPE.bodyRegular color={'text1'} display={'inline-block'} lineHeight={'1.2'} marginBottom={'12px'}>
            Recipient
          </TYPE.bodyRegular>
          <AddressField error={error} onChange={updateAddress} placeholder="Wallet Address" value={address} />
          {error && (
            <TYPE.bodyRegular color={'red'} marginTop={'12px'}>
              Address has no available claim
            </TYPE.bodyRegular>
          )}
        </RecipientWrapper>
        <ClaimButton buttonType={ButtonType.primary} disabled={amount.isZero()} onClick={submitClaim}>
          Claim OMN
        </ClaimButton>
      </ContentWrapper>
    </Modal>
  )
}

export const ModalCheckAddressWrapper = withTheme(ModalCheckAddress)
