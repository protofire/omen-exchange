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
import { IconArrowBack, IconClose } from '../../common/icons'
import { IconAlertInverted } from '../../common/icons/IconAlertInverted'
import { ContentWrapper, ModalNavigation } from '../common_styled'

interface Props extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  theme?: any
  onClose: () => void
}
const NavLeft = styled.div`
  display: flex;
  align-items: center;
`
const ModalMain = styled.div`
  width: 100%;
  display: grid;
  row-gap: 12px;
`
const DataRow = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  line-height: ${props => props.theme.fonts.defaultLineHeight};
`
const LightDataItem = styled.div`
  color: ${props => props.theme.textfield.placeholderColor};
`
const DarkDataItem = styled.div`
  color: ${props => props.theme.colors.textColorDark};
  font-weight: ${props => props.theme.textfield.fontWeight};
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
const ConditionalWrapper = styled.div<{ hideWrapper: boolean }>`
  ${props => props.hideWrapper && 'display:contents'};
  padding: 20px;

  border: ${props => props.theme.borders.borderLineDisabled};
  border-radius: ${props => props.theme.borders.commonBorderRadius};
  margin-bottom: 24px;
  column-gap: 20px;
`
const Divider = styled.div`
  border-top: ${props => props.theme.borders.borderLineDisabled};
  margin: 32px 0;
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
        <ModalNavigation style={{ padding: '0' }}>
          <NavLeft>
            {isLockAmountOpen && (
              <IconArrowBack
                hoverEffect={true}
                onClick={() => {
                  setIsLockAmountOpen(false)
                  setDisplayLockAmount(new BigNumber(0))
                  setAmountToDisplay('')
                }}
                style={{ marginRight: '12px' }}
              />
            )}
            <div>{isLockAmountOpen ? 'Lock Omen Token' : 'Omen Guild Membership'}</div>
          </NavLeft>
          <IconClose
            hoverEffect={true}
            onClick={() => {
              onClose()
            }}
          />
        </ModalNavigation>
        <ModalMain>
          <ConditionalWrapper hideWrapper={!isLockAmountOpen}>
            <DataRow>
              <LightDataItem>Omen Account</LightDataItem>
              <DarkDataItem>450 OMN</DarkDataItem>
            </DataRow>
            <DataRow>
              <LightDataItem>Locked in Guild</LightDataItem>
              <DarkDataItem>450 000 OMN</DarkDataItem>
            </DataRow>
          </ConditionalWrapper>
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
          {isLockAmountOpen && <Divider />}
          <DataRow>
            <LightDataItem>Vote Weight</LightDataItem>
            <DarkDataItem>0.60%</DarkDataItem>
          </DataRow>
          <DataRow>
            <LightDataItem>Unlock Date</LightDataItem>
            <DarkDataItem>
              March 31rd,2021-2:32 UTC{' '}
              <IconAlertInverted size="16" style={{ marginLeft: '8px', verticalAlign: 'text-bottom' }} />
            </DarkDataItem>
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
