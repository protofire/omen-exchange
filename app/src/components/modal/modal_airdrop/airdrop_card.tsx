import React, { HTMLAttributes } from 'react'
import styled, { withTheme } from 'styled-components'

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

const TopSectionSubHeading = styled.div`
  color: ${props => props.theme.colors.green};
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
  onCheckAddress?: () => void
}

const AirdropCard = (props: Props) => {
  const { displayButtons = true, onCheckAddress } = props
  const claim = async () => {
    // TODO: implement claim
  }

  return (
    <ModalCard>
      <TopSection>
        <TopSectionLeft>
          <IconOmen size={38} />
          <TopSectionDetails>
            <TopSectionHeading>Claimable Amount</TopSectionHeading>
            <TopSectionSubHeading>400 OMN</TopSectionSubHeading>
          </TopSectionDetails>
        </TopSectionLeft>
        {displayButtons && (
          <AirdropButton buttonType={ButtonType.primary} onClick={claim}>
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
                Enter an address to trigger a OMN claim. If the address has any claimable OMN it will be sent to them on
                submission.
              </BottomSectionSubheading>
            </BottomSectionTextWrapper>
          )}
        </BottomSectionTextWrapper>
        {displayButtons && <AirdropButton onClick={onCheckAddress}>Check</AirdropButton>}
      </BottomSection>
    </ModalCard>
  )
}

export const AirdropCardWrapper = withTheme(AirdropCard)
