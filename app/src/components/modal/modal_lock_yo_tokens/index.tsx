import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React, { HTMLAttributes, useState } from 'react'
import Modal from 'react-modal'
import styled, { withTheme } from 'styled-components'

import { STANDARD_DECIMALS } from '../../../common/constants'
import { formatBigNumber } from '../../../util/tools'
import { ExchangeCurrency, ExchangeType } from '../../../util/types'
import { Button } from '../../button/button'
import { ButtonType } from '../../button/button_styling_types'
import { TextfieldCustomPlaceholder } from '../../common'
import { BigNumberInput, BigNumberInputReturn } from '../../common/form/big_number_input'
import { IconClose } from '../../common/icons'
import { ContentWrapper, ModalNavigation } from '../common_styled'

interface Props extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  theme?: any
  onClose: () => void
}
const NavLeft = styled.div``
const ModalMain = styled.div`
  width: 100%;
`
const DataRow = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`
const LightDataItem = styled.div`
  color: grey;
`
const DarkDataItem = styled.div`
  color: black;
`
const ButtonSection = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  column-gap: 10px;
  margin-top: 28px;
`
const ButtonsLockUnlock = styled(Button)`
  width: 100%;
`

const ModalLockTokens = (props: Props) => {
  const { isOpen, onClose, theme } = props
  const [isLockAmountOpen, setIsLockAmountOpen] = useState<boolean>(false)
  const [displayLockAmount, setDisplayLockAmount] = useState<BigNumber>(Zero)
  const [amountToDisplay, setAmountToDisplay] = useState<string>('')
  console.log(isLockAmountOpen)
  return (
    <Modal isOpen={isOpen} style={theme.fluidHeightModal}>
      <ContentWrapper>
        <ModalNavigation>
          <NavLeft>
            <div>Omen Guild Membership</div>
          </NavLeft>
          <IconClose
            hoverEffect={true}
            onClick={() => {
              onClose()
            }}
          />
        </ModalNavigation>
        <ModalMain>
          <DataRow>
            <LightDataItem>Omen Account</LightDataItem>
            <DarkDataItem>450 OMN</DarkDataItem>
          </DataRow>
          <DataRow>
            <LightDataItem>Locked in Guild</LightDataItem>
            <DarkDataItem>450 000 OMN</DarkDataItem>
          </DataRow>
          {isLockAmountOpen && (
            <TextfieldCustomPlaceholder
              formField={
                <BigNumberInput
                  decimals={STANDARD_DECIMALS}
                  name="amount"
                  onChange={(e: BigNumberInputReturn) => {
                    setDisplayLockAmount(e.value)
                    setAmountToDisplay('')
                  }}
                  value={displayLockAmount}
                  valueToDisplay={amountToDisplay}
                />
              }
              onClickMaxButton={() => {
                const maxBalance = new BigNumber('1')
                setDisplayLockAmount(maxBalance)
                setAmountToDisplay(formatBigNumber(maxBalance, STANDARD_DECIMALS, 5))
              }}
              shouldDisplayMaxButton={true}
              symbol={'OMN'}
            />
          )}

          <DataRow>
            <LightDataItem>Vote Weight</LightDataItem>
            <DarkDataItem>0.60%</DarkDataItem>
          </DataRow>
          <DataRow>
            <LightDataItem>Unlock Date</LightDataItem>
            <DarkDataItem>March 31rd,2021-2:32 UTC</DarkDataItem>
          </DataRow>
        </ModalMain>
        <ButtonSection>
          {!isLockAmountOpen && <ButtonsLockUnlock buttonType={ButtonType.primaryLine}>Unlock Omen</ButtonsLockUnlock>}

          <ButtonsLockUnlock
            buttonType={ButtonType.primaryAlternative}
            onClick={() => setIsLockAmountOpen(!isLockAmountOpen)}
          >
            Lock OMN
          </ButtonsLockUnlock>
        </ButtonSection>
      </ContentWrapper>
    </Modal>
  )
}

export const ModalLockYoTokens = withTheme(ModalLockTokens)
