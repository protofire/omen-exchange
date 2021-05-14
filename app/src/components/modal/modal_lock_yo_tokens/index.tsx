import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React, { HTMLAttributes, useEffect, useState } from 'react'
import Modal from 'react-modal'
import styled, { withTheme } from 'styled-components'

import { STANDARD_DECIMALS } from '../../../common/constants'
import { useConnectedCPKContext } from '../../../hooks'
import { OmenGuildService } from '../../../services'
import { divBN, formatBigNumber, formatLockDate } from '../../../util/tools'
import { Button } from '../../button/button'
import { ButtonType } from '../../button/button_styling_types'
import { TextfieldCustomPlaceholder } from '../../common'
import { BigNumberInput, BigNumberInputReturn } from '../../common/form/big_number_input'
import { IconArrowBack, IconArrowRightLong, IconClose } from '../../common/icons'
import { IconAlertInverted } from '../../common/icons/IconAlertInverted'
import { ContentWrapper, ModalNavigation } from '../common_styled'

interface Props extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  theme?: any
  context: any
  onClose: () => void
  formattedOmenBalance: string
  omenBalance: BigNumber
}
const NavLeft = styled.div`
  display: flex;
  align-items: center;
`
const HeaderText = styled.div`
  font-family: Roboto;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 19px;
  letter-spacing: 0.2px;
  text-align: left;
  color: #37474f;
`

const DataRow = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  line-height: ${props => props.theme.fonts.defaultLineHeight};
`
const ModalMain = styled.div`
  width: 100%;

  & ${DataRow}:not(:last-child) {
    margin-bottom: 12px;
  }
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
`
const Divider = styled.div`
  border-top: ${props => props.theme.borders.borderLineDisabled};
  margin: 32px 0;
`
const PercentageText = styled.span<{ lightColor?: boolean }>`
  ${props => props.lightColor && `color:${props.theme.colors.textColorLighter}`};
`

const ModalLockTokens = (props: Props) => {
  const { context, formattedOmenBalance, isOpen, omenBalance, onClose, theme } = props
  const { account, library: provider, networkId } = context
  const cpk = useConnectedCPKContext()

  const [isLockAmountOpen, setIsLockAmountOpen] = useState<boolean>(false)
  const [displayLockAmount, setDisplayLockAmount] = useState<BigNumber>(Zero)
  const [amountToDisplay, setAmountToDisplay] = useState<string>('')
  const [totalLocked, setTotalLocked] = useState<BigNumber>(Zero)
  const [userLocked, setUserLocked] = useState<BigNumber>(Zero)
  const [timestamp, setTimestamp] = useState<number>(0)
  const [isUnlockAvailable, setIsUnlockAvailable] = useState<boolean>(false)
  const omen = new OmenGuildService(provider, networkId)

  useEffect(() => {
    ;(async () => {
      await getTokenLockInfo()
    })()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkId, account])

  const getTokenLockInfo = async () => {
    try {
      const locked = await omen.tokensLocked()
      const total = await omen.totalLocked()
      const lockTime = await omen.lockTime()
      const nowInSeconds: number = Math.floor(Date.now() / 1000)
      setIsUnlockAvailable(nowInSeconds + lockTime.toNumber() - locked.timestamp.toNumber() > 0)

      setTotalLocked(total)
      setUserLocked(locked.amount)
      setTimestamp(locked.timestamp.toNumber())
    } catch (e) {
      console.error(`Error while trying to fetch locked token info:  `, e.message)
    }
  }
  const lockTokens = async (amount: BigNumber) => {
    if (!cpk) return
    await cpk.lockTokens(amount)
  }
  const unlockTokens = async () => {
    if (!cpk) return
    await cpk.unlockTokens(userLocked)
  }

  return (
    <Modal isOpen={isOpen} style={theme.fluidHeightModal}>
      <ContentWrapper>
        <ModalNavigation style={{ padding: '0', marginBottom: isLockAmountOpen ? '32px' : '24px' }}>
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
            <HeaderText>{isLockAmountOpen ? 'Lock Omen Token' : 'Omen Guild Membership'}</HeaderText>
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
              <DarkDataItem> {formattedOmenBalance} OMN</DarkDataItem>
            </DataRow>
            <DataRow>
              <LightDataItem>Locked in Guild</LightDataItem>
              <DarkDataItem>{formatBigNumber(userLocked, 18, 2)} OMN</DarkDataItem>
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
                setDisplayLockAmount(omenBalance)
                setAmountToDisplay(formatBigNumber(omenBalance, STANDARD_DECIMALS, 2))
              }}
              shouldDisplayMaxButton={true}
              symbol={'OMN'}
            />
          )}
          {isLockAmountOpen && <Divider />}
          <DataRow style={{ marginTop: !isLockAmountOpen ? '12px' : '' }}>
            <LightDataItem>{isLockAmountOpen && 'Your '}Vote Weight</LightDataItem>
            <DarkDataItem>
              <PercentageText lightColor={!displayLockAmount.isZero()}>
                {!totalLocked.isZero() && !userLocked.isZero()
                  ? (divBN(userLocked, totalLocked) * 100).toFixed(2)
                  : '0.00'}
                %
              </PercentageText>

              {!displayLockAmount.isZero() && (
                <>
                  <IconArrowRightLong
                    color={theme.colors.textColorDark}
                    height={8}
                    style={{ margin: '0 10px' }}
                    width={11}
                  />
                  {(divBN(userLocked.add(displayLockAmount), totalLocked) * 100).toFixed(2)}%
                </>
              )}
            </DarkDataItem>
          </DataRow>
          <DataRow>
            <LightDataItem>Unlock Date</LightDataItem>
            <DarkDataItem>
              {formatLockDate(timestamp * 1000)}
              <IconAlertInverted size="16" style={{ marginLeft: '8px', verticalAlign: 'text-bottom' }} />
            </DarkDataItem>
          </DataRow>
        </ModalMain>
        <ButtonSection>
          {!isLockAmountOpen && (
            <ButtonsLockUnlock
              buttonType={ButtonType.primaryLine}
              disabled={isUnlockAvailable}
              onClick={() => {
                unlockTokens()
              }}
            >
              Unlock Omen
            </ButtonsLockUnlock>
          )}

          <ButtonsLockUnlock
            buttonType={ButtonType.primaryAlternative}
            disabled={
              (displayLockAmount.isZero() || omenBalance.isZero() || displayLockAmount.gt(omenBalance)) &&
              isLockAmountOpen
            }
            onClick={() => (isLockAmountOpen ? lockTokens(displayLockAmount) : setIsLockAmountOpen(true))}
          >
            Lock OMN
          </ButtonsLockUnlock>
        </ButtonSection>
      </ContentWrapper>
    </Modal>
  )
}

export const ModalLockYoTokens = withTheme(ModalLockTokens)
