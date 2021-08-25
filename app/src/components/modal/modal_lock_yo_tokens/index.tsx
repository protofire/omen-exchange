import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React, { HTMLAttributes, useEffect, useState } from 'react'
import Modal from 'react-modal'
import ReactTooltip from 'react-tooltip'
import styled, { withTheme } from 'styled-components'

import { STANDARD_DECIMALS } from '../../../common/constants'
import { useAirdropService } from '../../../hooks'
import { ERC20Service, OmenGuildService } from '../../../services'
import { TYPE } from '../../../theme'
import { getToken, networkIds } from '../../../util/networks'
import { bigNumberToString, daysUntil, divBN, formatLockDate } from '../../../util/tools'
import { TransactionStep } from '../../../util/types'
import { Button } from '../../button/button'
import { ButtonStateful, ButtonStates } from '../../button/button_stateful'
import { ButtonType } from '../../button/button_styling_types'
import { TextfieldCustomPlaceholder } from '../../common'
import { BigNumberInput, BigNumberInputReturn } from '../../common/form/big_number_input'
import { IconArrowBack, IconClose, IconExclamation, IconOmen } from '../../common/icons'
import { IconAlertInverted } from '../../common/icons/IconAlertInverted'
import { ArrowIcon } from '../../market/common_sections/tables/new_value/img/ArrowIcon'
import { ContentWrapper, ModalNavigation } from '../common_styled'
import { AirdropCardWrapper } from '../modal_airdrop/airdrop_card'
import { ModalCheckAddressWrapper } from '../modal_airdrop/check_address'
import { ModalTransactionWrapper } from '../modal_transaction'

interface Props extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  theme?: any
  context: any
  onClose: () => void
  setIsModalLockTokensOpen: any
}

const NavLeft = styled.div`
  display: flex;
  align-items: center;
`

const DataRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  line-height: ${props => props.theme.fonts.defaultLineHeight};
`

const LightDataItem = styled(TYPE.bodyRegular)`
  color: ${props => props.theme.text2};
`
const DarkDataItem = styled(TYPE.bodyMedium)`
  display: flex;
  align-items: center;
  color: ${props => props.theme.text1};
`

const ModalMain = styled.div`
  width: 100%;

  & ${DataRow}:not(:last-child) {
    margin-bottom: 12px;
  }
`
const ButtonSection = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  column-gap: 20px;
  margin-top: 24px;
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
  margin: 24px 0;
`

const DaiBanner = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid ${props => props.theme.dai};
  border-radius: ${props => props.theme.cards.borderRadius};
  width: 100%;
  margin-bottom: 16px;
`

const ModalLockTokens = (props: Props) => {
  const { context, isOpen, setIsModalLockTokensOpen, theme } = props
  const { account, balances, cpk, library: provider, networkId, relay, setTxState, txHash, txState } = context

  const { fetchBalances, formattedxDaiBalance, omenBalance, xOmenBalance } = balances

  const { claimAmount, fetchClaimAmount } = useAirdropService()

  const [omen, setOmen] = useState(new OmenGuildService(provider, networkId))
  const [isLockAmountOpen, setIsLockAmountOpen] = useState<boolean>(false)
  const [displayLockAmount, setDisplayLockAmount] = useState<BigNumber>(Zero)
  const [amountToDisplay, setAmountToDisplay] = useState<string>('')
  const [totalLocked, setTotalLocked] = useState<BigNumber>(Zero)
  const [userLocked, setUserLocked] = useState<BigNumber>(Zero)
  const [timestamp, setTimestamp] = useState<number>(0)
  const [unlockTimeLeft, setUnlockTimeLeft] = useState<number>(0)
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false)
  const [transactionMessage, setTransactionMessage] = useState<string>('')
  const [omenAllowance, setOmenAllowance] = useState<BigNumber>(Zero)
  const [allowanceState, setAllowanceState] = useState<ButtonStates>(ButtonStates.idle)
  const [checkAddress, setCheckAddress] = useState(false)
  const displayDaiBanner = parseFloat(formattedxDaiBalance) === 0

  const isApproveVisible =
    (omenAllowance.isZero() && isLockAmountOpen) ||
    (allowanceState === ButtonStates.finished && !omenAllowance.isZero())

  useEffect(() => {
    setAllowanceState(ButtonStates.idle)
    ;(async () => {
      setOmen(new OmenGuildService(provider, networkId))
      await getTokenLockInfo()
      await fetchAllowance()
    })()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkId, account, cpk])

  const getTokenLockInfo = async () => {
    try {
      if (cpk?.address && omen.omenGuildAddress) {
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
      if (cpk && omen.omenGuildAddress) {
        let allowanceAddress
        if (context.networkId === networkIds.MAINNET && !context.relay) {
          allowanceAddress = await omen.tokenVault()
        } else {
          allowanceAddress = cpk.address
        }

        const { address: omenAddress } = getToken(relay ? networkIds.XDAI : networkId, 'omn')

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

        if (context.networkId === networkIds.MAINNET && !relay) {
          allowanceAddress = await omen.tokenVault()
        } else {
          allowanceAddress = cpk.address
        }
        const { address: omenAddress } = getToken(relay ? networkIds.XDAI : networkId, 'omn')

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
      setTransactionMessage(`Lock ${bigNumberToString(amount, STANDARD_DECIMALS, 2)} OMN`)

      setIsTransactionModalOpen(true)

      await cpk.lockTokens({ amount })

      await getTokenLockInfo()
      await fetchBalances()
      setDisplayLockAmount(Zero)
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
      setTransactionMessage(`Unlock ${bigNumberToString(userLocked, STANDARD_DECIMALS, 2)} OMN`)

      setIsTransactionModalOpen(true)
      await cpk.unlockTokens({ amount: userLocked })
    } catch (e) {
      setTxState(TransactionStep.error)
    }
  }

  const claim = async (account: string, amount: BigNumber) => {
    if (!cpk || !account) {
      return
    }

    try {
      setTransactionMessage(`Claim ${bigNumberToString(amount, STANDARD_DECIMALS)} OMN`)
      setTxState(TransactionStep.waitingConfirmation)
      setIsTransactionModalOpen(true)
      await cpk.claimAirdrop({ account })
      await fetchClaimAmount()
      await balances.fetchBalances()
    } catch (e) {
      setIsTransactionModalOpen(false)
    }
  }

  const onClose = () => {
    setIsTransactionModalOpen(false)
    setCheckAddress(false)
    setIsLockAmountOpen(false)
    setDisplayLockAmount(Zero)
    props.onClose()
  }

  return (
    <>
      <Modal isOpen={isOpen && !isTransactionModalOpen && !checkAddress} style={theme.fluidHeightModal}>
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
              <TYPE.heading3 color={'text1'} textAlign={'left'}>
                {isLockAmountOpen ? 'Lock Omen Token' : 'Omen Guild Membership'}
              </TYPE.heading3>
            </NavLeft>
            <IconClose hoverEffect={true} onClick={onClose} />
          </ModalNavigation>
          <ModalMain>
            <ConditionalWrapper hideWrapper={!isLockAmountOpen}>
              <DataRow>
                <LightDataItem>Wallet Balance</LightDataItem>
                <DarkDataItem>
                  {bigNumberToString(omenBalance, STANDARD_DECIMALS, 2)} OMN
                  {isLockAmountOpen && <IconOmen size={24} style={{ marginLeft: '10px' }} />}
                </DarkDataItem>
              </DataRow>
              {relay && (
                <DataRow>
                  <LightDataItem>Omen Account</LightDataItem>
                  <DarkDataItem>
                    {bigNumberToString(xOmenBalance, STANDARD_DECIMALS, 2)} OMN
                    {isLockAmountOpen && <IconOmen size={24} style={{ marginLeft: '10px' }} />}
                  </DarkDataItem>
                </DataRow>
              )}
              <DataRow>
                <LightDataItem>Locked in Guild</LightDataItem>
                <DarkDataItem>
                  {bigNumberToString(userLocked, 18, 2)} OMN
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
                  setAmountToDisplay(bigNumberToString(omenBalance, STANDARD_DECIMALS, 2, true))
                }}
                shouldDisplayMaxButton={true}
                symbol={'OMN'}
              />
            )}
            {isLockAmountOpen && <Divider />}

            <DataRow style={{ marginTop: !isLockAmountOpen ? '12px' : '' }}>
              <LightDataItem>{isLockAmountOpen && 'Your '}Vote Weight</LightDataItem>
              <DarkDataItem>
                <TYPE.bodyMedium color={!displayLockAmount.isZero() && 'text2'}>
                  {!totalLocked.isZero() && !userLocked.isZero()
                    ? (divBN(userLocked, totalLocked) * 100).toFixed(2)
                    : '0.00'}
                  %
                </TYPE.bodyMedium>

                {!displayLockAmount.isZero() && (
                  <>
                    <ArrowIcon color={theme.text1} style={{ margin: '0 10px' }} />
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
                      data-tip={`${daysUntil(timestamp)} Days remaining`}
                      style={{ marginLeft: '8px' }}
                    >
                      <IconAlertInverted size="16" style={{ verticalAlign: 'text-bottom' }} />
                    </div>
                  </>
                ) : (
                  '-'
                )}
              </DarkDataItem>
            </DataRow>
          </ModalMain>
          <ReactTooltip
            className="customMarketTooltip"
            data-multiline={true}
            effect="solid"
            id="unlockDate"
            place="top"
            type="light"
          />
          <ButtonSection>
            {!isLockAmountOpen && (
              <ButtonsLockUnlock buttonType={ButtonType.primary} disabled={unlockTimeLeft >= 0} onClick={unlockTokens}>
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
              buttonType={ButtonType.primary}
              disabled={
                (displayLockAmount.isZero() ||
                  omenBalance.isZero() ||
                  displayLockAmount.gt(omenBalance) ||
                  displayLockAmount.gt(omenAllowance)) &&
                isLockAmountOpen
              }
              onClick={() => (isLockAmountOpen ? lockTokens(displayLockAmount) : setIsLockAmountOpen(true))}
            >
              Lock OMN
            </ButtonsLockUnlock>
          </ButtonSection>
        </ContentWrapper>
        {!isLockAmountOpen && relay && (
          <>
            <Divider />
            {displayDaiBanner && (
              <DaiBanner>
                <IconExclamation color={theme.dai} />
                <TYPE.bodyRegular color={'dai'} margin={'0px 12px'} textAlign={'center'}>
                  Deposit Dai in order to claim OMN tokens.
                </TYPE.bodyRegular>
              </DaiBanner>
            )}
            <AirdropCardWrapper
              claim={claim}
              displayAmount={claimAmount}
              onCheckAddress={() => setCheckAddress(true)}
            />
          </>
        )}
      </Modal>
      <ModalTransactionWrapper
        confirmations={0}
        confirmationsRequired={0}
        icon={<IconOmen size={24} style={{ marginLeft: '10px' }} />}
        isOpen={isTransactionModalOpen}
        message={transactionMessage}
        onClose={onClose}
        txHash={txHash}
        txState={txState}
      />
      <ModalCheckAddressWrapper
        claim={claim}
        isOpen={checkAddress && !isTransactionModalOpen}
        onBack={() => setCheckAddress(false)}
        onClose={onClose}
      />
    </>
  )
}

export const ModalLockYoTokens = withTheme(ModalLockTokens)
