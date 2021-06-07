import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React, { HTMLAttributes, useEffect, useState } from 'react'
import Modal from 'react-modal'
import ReactTooltip from 'react-tooltip'
import styled, { withTheme } from 'styled-components'

import { STANDARD_DECIMALS } from '../../../common/constants'
import { useConnectedCPKContext } from '../../../hooks'
import { ERC20Service, OmenGuildService } from '../../../services'
import { networkIds } from '../../../util/networks'
import { divBN, formatBigNumber, formatLockDate } from '../../../util/tools'
import { TransactionStep } from '../../../util/types'
import { Button } from '../../button/button'
import { ButtonStateful, ButtonStates } from '../../button/button_stateful'
import { ButtonType } from '../../button/button_styling_types'
import { TextfieldCustomPlaceholder } from '../../common'
import { BigNumberInput, BigNumberInputReturn } from '../../common/form/big_number_input'
import { IconArrowBack, IconClose, IconOmen } from '../../common/icons'
import { IconAlertInverted } from '../../common/icons/IconAlertInverted'
import { ArrowIcon } from '../../market/common/new_value/img/ArrowIcon'
import { ContentWrapper, ModalNavigation } from '../common_styled'
import { ModalTransactionWrapper } from '../modal_transaction'

interface Props extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  theme?: any
  context: any
  onClose: () => void
  formattedOmenBalance: string
  omenBalance: BigNumber
  setIsModalLockTokensOpen: any
  fetchBalances: () => Promise<void>
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
  align-items: center;
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
  display: flex;
  align-items: center;
  color: ${props => props.theme.colors.textColorDark};
  font-weight: ${props => props.theme.textfield.fontWeight};
`
const ButtonSection = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  column-gap: 20px;
  margin-top: 32px;
`
const ButtonsLockUnlock = styled(Button)`
  flex: 1;
`
const ApproveButton = styled(ButtonStateful)`
  flex: 1;
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
  const {
    context,
    fetchBalances,
    formattedOmenBalance,
    isOpen,
    omenBalance,
    onClose,
    setIsModalLockTokensOpen,
    theme,
  } = props
  const { account, library: provider, networkId } = context
  const cpk = useConnectedCPKContext()
  const omen = new OmenGuildService(provider, networkId)

  const [isLockAmountOpen, setIsLockAmountOpen] = useState<boolean>(false)
  const [displayLockAmount, setDisplayLockAmount] = useState<BigNumber>(Zero)
  const [amountToDisplay, setAmountToDisplay] = useState<string>('')
  const [totalLocked, setTotalLocked] = useState<BigNumber>(Zero)
  const [userLocked, setUserLocked] = useState<BigNumber>(Zero)
  const [timestamp, setTimestamp] = useState<number>(0)
  const [unlockTimeLeft, setUnlockTimeLeft] = useState<number>(0)
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false)
  const [transactionMessage, setTransactionMessage] = useState<string>('')
  const [txHash, setTxHash] = useState<any>('')
  const [txState, setTxState] = useState<TransactionStep>(TransactionStep.idle)
  const [txNetId, setTxNetId] = useState()
  const [omenAllowance, setOmenAllowance] = useState<BigNumber>(Zero)
  const [allowanceState, setAllowanceState] = useState<ButtonStates>(ButtonStates.idle)

  const isApproveVisible =
    (omenAllowance.isZero() && isLockAmountOpen) ||
    (allowanceState === ButtonStates.finished && !omenAllowance.isZero())

  useEffect(() => {
    setAllowanceState(ButtonStates.idle)
    ;(async () => {
      await getTokenLockInfo()
      await fetchAllowance()
    })()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkId, account, cpk])

  const getTokenLockInfo = async () => {
    try {
      if (cpk?.address) {
        let address
        if (context.networkId === networkIds.MAINNET && !context.relay) {
          address = await omen.tokenVault()
        } else {
          address = cpk.address
        }

        const locked = await omen.tokensLocked(address)
        const total = await omen.totalLocked()

        const nowInSeconds: number = Math.floor(Date.now() / 1000)

        if (locked.timestamp.toNumber() === 0) setUnlockTimeLeft(0)
        else setUnlockTimeLeft(locked.timestamp.toNumber() - nowInSeconds)

        setTotalLocked(total)
        setUserLocked(locked.amount)
        setTimestamp(locked.timestamp.toNumber())
      }
    } catch (e) {
      console.error(`Error while trying to fetch locked token info:  `, e.message)
    }
  }
  const fetchAllowance = async () => {
    try {
      if (cpk) {
        let allowanceAddress
        if (context.networkId === networkIds.MAINNET && !context.relay) {
          allowanceAddress = await omen.tokenVault()
        } else {
          allowanceAddress = cpk.address
        }

        const omenAddress = await omen.omenTokenAddress()

        const collateralService = new ERC20Service(provider, account, omenAddress)
        const allowance = await collateralService.allowance(account, allowanceAddress)
        setOmenAllowance(allowance)
      }
    } catch (e) {
      console.error(`Error while fetching allowance:  `, e.message)
    }
  }
  const approve = async () => {
    try {
      if (cpk?.address) {
        setAllowanceState(ButtonStates.working)
        let allowanceAddress

        if (context.networkId === networkIds.MAINNET && !context.relay) {
          allowanceAddress = await omen.tokenVault()
        } else {
          allowanceAddress = cpk.address
        }
        const omenAddress = await omen.omenTokenAddress()

        const collateralService = new ERC20Service(context.rawWeb3Context.library, account, omenAddress)

        await collateralService.approveUnlimited(allowanceAddress)
        await fetchAllowance()
        setAllowanceState(ButtonStates.finished)
      }
    } catch {
      setAllowanceState(ButtonStates.idle)
    }
  }
  const lockTokens = async (amount: BigNumber) => {
    if (!cpk) return

    try {
      setTxState(TransactionStep.waitingConfirmation)
      setTransactionMessage(`Lock ${formatBigNumber(amount, STANDARD_DECIMALS, 2)} OMN`)

      setIsTransactionModalOpen(true)

      const transaction = await cpk.lockTokens(amount, setTxState, setTxHash)

      setTxNetId(provider.network.chainId)
      setTxHash(transaction)
      await getTokenLockInfo()
      await fetchBalances()
      setIsTransactionModalOpen(false)
      setIsLockAmountOpen(false)
      setIsModalLockTokensOpen(true)
    } catch (e) {
      setTxState(TransactionStep.error)
    }
  }
  const unlockTokens = async () => {
    if (!cpk) return
    setTxState(TransactionStep.waitingConfirmation)
    try {
      setTransactionMessage(`Unlock ${formatBigNumber(userLocked, STANDARD_DECIMALS, 2)} OMN`)

      setIsTransactionModalOpen(true)
      const hash = await cpk.unlockTokens(userLocked)
      setTxNetId(provider.network.chainId)
      setTxHash(hash)
    } catch (e) {
      setTxState(TransactionStep.error)
    }
  }

  return (
    <>
      <Modal isOpen={isOpen && !isTransactionModalOpen} style={theme.fluidHeightModal}>
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
                <DarkDataItem>
                  {formattedOmenBalance} OMN{isLockAmountOpen && <IconOmen size={24} style={{ marginLeft: '10px' }} />}
                </DarkDataItem>
              </DataRow>
              <DataRow>
                <LightDataItem>Locked in Guild</LightDataItem>
                <DarkDataItem>
                  {formatBigNumber(userLocked, 18, 2)} OMN
                  {isLockAmountOpen && <IconOmen size={24} style={{ marginLeft: '10px' }} />}
                </DarkDataItem>
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
                    <ArrowIcon color={theme.colors.textColorDark} style={{ margin: '0 10px' }} />
                    {(divBN(userLocked.add(displayLockAmount), totalLocked) * 100).toFixed(2)}%
                  </>
                )}
              </DarkDataItem>
            </DataRow>

            <DataRow>
              <LightDataItem>Unlock Date</LightDataItem>
              <DarkDataItem>
                {timestamp !== 0 ? (
                  <>
                    {formatLockDate(timestamp * 1000)}
                    <div
                      data-arrow-color="transparent"
                      data-for="unlockDate"
                      data-tip={`${(5265716 / 86400).toFixed(0)} Days remaining`}
                    >
                      <IconAlertInverted size="16" style={{ marginLeft: '8px', verticalAlign: 'text-bottom' }} />
                    </div>
                  </>
                ) : (
                  '-'
                )}
              </DarkDataItem>
            </DataRow>
            <ReactTooltip
              className="customMarketTooltip"
              data-multiline={true}
              effect="solid"
              id="unlockDate"
              offset={{ top: -70, left: 20 }}
              place="top"
              type="light"
            />
          </ModalMain>
          <ButtonSection>
            {!isLockAmountOpen && (
              <ButtonsLockUnlock
                buttonType={ButtonType.primaryAlternative}
                disabled={unlockTimeLeft >= 0}
                onClick={unlockTokens}
              >
                Unlock Omen
              </ButtonsLockUnlock>
            )}
            {isApproveVisible && isLockAmountOpen && (
              <ApproveButton
                disabled={allowanceState !== ButtonStates.idle}
                extraText
                onClick={approve}
                state={allowanceState}
              >
                {allowanceState === ButtonStates.idle && `Approve OMN`}
                {allowanceState === ButtonStates.working && 'Approving'}
                {allowanceState === ButtonStates.finished && 'Approved'}
              </ApproveButton>
            )}
            <ButtonsLockUnlock
              buttonType={ButtonType.primaryAlternative}
              disabled={
                (displayLockAmount.isZero() ||
                  omenBalance.isZero() ||
                  displayLockAmount.gte(omenBalance) ||
                  displayLockAmount.gt(omenAllowance)) &&
                isLockAmountOpen
              }
              onClick={() => (isLockAmountOpen ? lockTokens(displayLockAmount) : setIsLockAmountOpen(true))}
            >
              Lock OMN
            </ButtonsLockUnlock>
          </ButtonSection>
        </ContentWrapper>
      </Modal>
      <ModalTransactionWrapper
        confirmations={0}
        confirmationsRequired={0}
        icon={<IconOmen size={24} style={{ marginLeft: '10px' }} />}
        isOpen={isTransactionModalOpen}
        message={transactionMessage}
        netId={txNetId}
        onClose={() => {
          setIsTransactionModalOpen(false)
          onClose()
        }}
        txHash={txHash}
        txState={txState}
      />
    </>
  )
}

export const ModalLockYoTokens = withTheme(ModalLockTokens)
