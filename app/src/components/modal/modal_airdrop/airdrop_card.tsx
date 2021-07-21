import { BigNumber } from 'ethers/utils'
import React, { HTMLAttributes } from 'react'
import styled, { withTheme } from 'styled-components'

import { STANDARD_DECIMALS } from '../../../common/constants'
import { useConnectedWeb3Context } from '../../../hooks'
import { formatBigNumber } from '../../../util/tools'
import { Button } from '../../button'
import { ButtonType } from '../../button/button_styling_types'
import { IconOmen } from '../../common/icons'
import { BalanceSection, ModalCard } from '../common_styled'

const TopSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
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
  font-weight: ${props => props.theme.textfield.fontWeight};
`

interface Subheading {
  green: boolean
}

const TopSectionSubHeading = styled.div<Subheading>`
  color: ${props => (props.green ? props.theme.colors.green : props.theme.colors.textColorLighter)};
  font-weight: ${props => props.theme.textfield.fontWeight};
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
  font-weight: ${props => props.theme.textfield.fontWeight};
`

const BottomSectionSubheading = styled.div`
  color: ${props => props.theme.colors.textColorLighter};
  font-size: ${props => props.theme.fonts.defaultSize};
`

const BottomSectionDescription = styled.div`
  color: ${props => props.theme.colors.textColorLighter};
`

const AirdropButton = styled(Button)`
  width: 75px;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  theme: any
  displayButtons?: boolean
  displayAmount: BigNumber
  claim?: (account: string, amount: BigNumber) => Promise<void>
  onCheckAddress?: () => void
}

const AirdropCard = (props: Props) => {
  const { claim, displayAmount, displayButtons = true, onCheckAddress } = props

  const { account } = useConnectedWeb3Context()

  const submitClaim = () => {
    if (claim && account && displayAmount) {
      claim(account, displayAmount)
    }
  }

  const claimIsDisabled = !displayAmount || displayAmount.isZero()

  return (
    <>
      <ModalCard>
        <TopSection>
          <TopSectionLeft>
            <IconOmen id="airdrop" size={38} />
            <TopSectionDetails>
              <TopSectionHeading>Claimable Amount</TopSectionHeading>
              <TopSectionSubHeading green={!claimIsDisabled}>
                {formatBigNumber(displayAmount, STANDARD_DECIMALS)} OMN
              </TopSectionSubHeading>
            </TopSectionDetails>
          </TopSectionLeft>
          {displayButtons && (
            <AirdropButton buttonType={ButtonType.primaryAlternative} disabled={claimIsDisabled} onClick={submitClaim}>
              Claim
            </AirdropButton>
          )}
        </TopSection>
        <BottomSection>
          <BottomSectionTextWrapper>
            {displayButtons ? (
              <BottomSectionTextWrapper>
                <BottomSectionHeading>Claim OMN token</BottomSectionHeading>
                <BottomSectionSubheading>check address for claimable OMN</BottomSectionSubheading>
              </BottomSectionTextWrapper>
            ) : (
              <BottomSectionTextWrapper>
                <BottomSectionDescription>
                  Enter an address to trigger a OMN claim. If the address has any claimable OMN it will be sent to them
                  on submission.
                </BottomSectionDescription>
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
