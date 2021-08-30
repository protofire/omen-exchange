import { BigNumber } from 'ethers/utils'
import React, { HTMLAttributes } from 'react'
import styled, { withTheme } from 'styled-components'

import { STANDARD_DECIMALS } from '../../../common/constants'
import { useConnectedWeb3Context } from '../../../contexts'
import { TYPE } from '../../../theme'
import { bigNumberToString } from '../../../util/tools'
import { Button } from '../../button'
import { ButtonType } from '../../button/button_styling_types'
import { IconOmen } from '../../common/icons'
import { BalanceSection, ModalCard } from '../common_styled'

const TopSection = styled.div<{ displayCheckAddress: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  width: 100%;
  border-bottom: ${props => (props.displayCheckAddress ? props.theme.borders.borderLineDisabled : '')};
`

const TopSectionLeft = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const TopSectionDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0;
  margin-left: 16px;
`

const BottomSection = styled(BalanceSection as any)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
`

const BottomSectionTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`

const AirdropButton = styled(Button)`
  width: 75px;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  claim?: (account: string, amount: BigNumber) => Promise<void>
  displayAmount: BigNumber
  displayButtons?: boolean
  displayCheckAddress?: boolean
  onCheckAddress?: () => void
  theme: any
}

const AirdropCard = (props: Props) => {
  const { claim, displayAmount, displayButtons = true, displayCheckAddress = true, onCheckAddress } = props

  const { account, balances } = useConnectedWeb3Context()

  const submitClaim = () => {
    if (claim && account && displayAmount) {
      claim(account, displayAmount)
    }
  }

  const claimIsDisabled = !displayAmount || displayAmount.isZero() || balances.xDaiBalance.isZero()

  return (
    <>
      <ModalCard>
        <TopSection displayCheckAddress={displayCheckAddress}>
          <TopSectionLeft>
            <IconOmen id="airdrop" size={38} />
            <TopSectionDetails>
              <TYPE.bodyMedium color={'text1'}>Claimable Amount</TYPE.bodyMedium>
              <TYPE.bodyMedium color={displayAmount.isZero() ? 'text2' : 'profit'}>
                {bigNumberToString(displayAmount, STANDARD_DECIMALS)} OMN
              </TYPE.bodyMedium>
            </TopSectionDetails>
          </TopSectionLeft>
          {displayButtons && (
            <AirdropButton buttonType={ButtonType.primary} disabled={claimIsDisabled} onClick={submitClaim}>
              Claim
            </AirdropButton>
          )}
        </TopSection>
        {displayCheckAddress && (
          <BottomSection>
            {' '}
            {displayButtons ? (
              <>
                {' '}
                <BottomSectionTextWrapper>
                  {' '}
                  <TYPE.bodyMedium color={'text1'}>Claim OMN token</TYPE.bodyMedium>{' '}
                  <TYPE.bodyRegular color={'text2'}>check address for claimable OMN</TYPE.bodyRegular>{' '}
                </BottomSectionTextWrapper>{' '}
                <AirdropButton onClick={onCheckAddress}>Check</AirdropButton>{' '}
              </>
            ) : (
              <TYPE.bodyRegular color={'text2'}>
                {' '}
                Enter an address to trigger a OMN claim. If the address has any claimable OMN it will be sent to them on
                submission.{' '}
              </TYPE.bodyRegular>
            )}{' '}
          </BottomSection>
        )}
      </ModalCard>
    </>
  )
}

export const AirdropCardWrapper = withTheme(AirdropCard)
