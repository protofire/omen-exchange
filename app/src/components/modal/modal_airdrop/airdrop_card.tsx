import { BigNumber } from 'ethers/utils'
import React, { HTMLAttributes, useEffect, useState } from 'react'
import styled, { withTheme } from 'styled-components'

import { STANDARD_DECIMALS } from '../../../common/constants'
import { useAirdropService, useConnectedWeb3Context } from '../../../hooks'
import { formatBigNumber } from '../../../util/tools'
import { Button } from '../../button'
import { ButtonType } from '../../button/button_styling_types'
import { IconOmen } from '../../common/icons'
import { BalanceSection, ModalCard } from '../common_styled'

const TopSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  width: 100%;
  border-bottom: ${props => props.theme.borders.borderLineDisabled};
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

const TopSectionHeading = styled.div`
  color: ${props => props.theme.colors.textColorDark};
  font-weight: 500;
`

interface Subheading {
  green: boolean
}

const TopSectionSubHeading = styled.div<Subheading>`
  color: ${props => (props.green ? props.theme.colors.green : props.theme.colors.textColorLighter)};
  font-weight: 500;
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

const BottomSectionHeading = styled.div`
  color: ${props => props.theme.colors.textColorDark};
  font-weight: 500;
`

const BottomSectionSubheading = styled.div`
  color: ${props => props.theme.colors.textColorLighter};
  font-size: 12;
`

const AirdropButton = styled(Button)`
  width: 75px;
  height: 40px;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  theme: any
  displayButtons?: boolean
  displayAmount?: BigNumber
  claim?: (account: string, amount: BigNumber) => Promise<void>
  onCheckAddress?: () => void
}

const AirdropCard = (props: Props) => {
  const { claim, displayAmount, displayButtons = true, onCheckAddress } = props

  const { account, library, networkId, relay } = useConnectedWeb3Context()

  const airdrop = useAirdropService()

  const [amount, setAmount] = useState(new BigNumber('0'))

  useEffect(() => {
    const getClaimAmount = async () => {
      const newAmount = await airdrop.getClaimAmount(account)
      setAmount(newAmount)
    }
    if (account) {
      getClaimAmount()
    }
  }, [airdrop, account, library, networkId, relay])

  const submitClaim = () => {
    if (claim && account) {
      claim(account, amount)
    }
  }

  const claimIsDisabled = displayAmount ? displayAmount.isZero() : amount.isZero()

  return (
    <>
      <ModalCard>
        <TopSection>
          <TopSectionLeft>
            <IconOmen size={38} />
            <TopSectionDetails>
              <TopSectionHeading>Claimable Amount</TopSectionHeading>
              <TopSectionSubHeading green={!claimIsDisabled}>
                {formatBigNumber(displayAmount || amount, STANDARD_DECIMALS)} OMN
              </TopSectionSubHeading>
            </TopSectionDetails>
          </TopSectionLeft>
          {displayButtons && (
            <AirdropButton buttonType={ButtonType.primary} disabled={claimIsDisabled} onClick={submitClaim}>
              Claim
            </AirdropButton>
          )}
        </TopSection>
        <BottomSection>
          <BottomSectionTextWrapper>
            {displayButtons ? (
              <BottomSectionTextWrapper>
                <BottomSectionHeading>Claim OMN token</BottomSectionHeading>
                <BottomSectionSubheading>Check address for claimable OMN</BottomSectionSubheading>
              </BottomSectionTextWrapper>
            ) : (
              <BottomSectionTextWrapper>
                <BottomSectionSubheading>
                  Enter an address to trigger a OMN claim. If the address has any claimable OMN it will be sent to them
                  on submission.
                </BottomSectionSubheading>
              </BottomSectionTextWrapper>
            )}
          </BottomSectionTextWrapper>
          {displayButtons && <AirdropButton onClick={onCheckAddress}>Check</AirdropButton>}
        </BottomSection>
      </ModalCard>
    </>
  )
}

export const AirdropCardWrapper = withTheme(AirdropCard)
