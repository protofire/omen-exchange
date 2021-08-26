import { BigNumber } from 'ethers/utils'
import React, { HTMLAttributes, useState } from 'react'
import Modal from 'react-modal'
import styled, { withTheme } from 'styled-components'

import { useConnectedWeb3Context } from '../../../contexts'
import { useAirdropService } from '../../../hooks'
import { TYPE } from '../../../theme'
import { Button } from '../../button'
import { ButtonType } from '../../button/button_styling_types'
import { Textfield } from '../../common'
import { IconArrowBack, IconClose, IconExclamation } from '../../common/icons'
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
  border-color: ${props => (props.error ? props.theme.alert : props.theme.border1)};
  &:hover {
    border-color: ${props => (props.error ? props.theme.alert : props.theme.border2)};
  }

  &:active,
  &:focus {
    border-color: ${props => (props.error ? props.theme.alert : props.theme.border3)};
  }
`

const DaiBanner = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid ${props => props.theme.dai};
  border-radius: ${props => props.theme.cards.borderRadius};
  width: 100%;
  margin-top: 16px;
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
  const { balances } = useConnectedWeb3Context()

  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState(new BigNumber('0'))
  const [loading, setLoading] = useState(false)
  const displayDaiBanner = balances.xDaiBalance.isZero()

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
            <TYPE.heading3 color={'text1'} margin={'0'} marginLeft={'16px'} marginTop={'2px'}>
              Check Address
            </TYPE.heading3>
          </ModalNavigationLeft>
          <IconClose hoverEffect={true} onClick={onClose} />
        </ModalNavigation>
        <AirdropCardWrapper displayAmount={amount} displayButtons={false} />
        {displayDaiBanner && (
          <DaiBanner>
            <IconExclamation color={theme.dai} />
            <TYPE.bodyRegular color={'dai'} marginLeft={'12px'}>
              Deposit Dai in order to claim OMN tokens.
            </TYPE.bodyRegular>
          </DaiBanner>
        )}
        <RecipientWrapper>
          <TYPE.bodyRegular color={'text1'} marginBottom={'12px'}>
            Recipient
          </TYPE.bodyRegular>
          <AddressField error={error} onChange={updateAddress} placeholder="Wallet Address" value={address} />
          {error && (
            <TYPE.bodyRegular color={'alert'} marginTop={'12px'}>
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
