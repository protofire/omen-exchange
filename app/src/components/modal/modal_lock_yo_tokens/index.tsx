import React, { HTMLAttributes } from 'react'
import Modal from 'react-modal'
import styled, { withTheme } from 'styled-components'

import { Button } from '../../button/button'
import { ButtonType } from '../../button/button_styling_types'
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
  width: 50%;
`

const ModalLockTokens = (props: Props) => {
  const { isOpen, onClose, theme } = props

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
            <LightDataItem>Omen Account</LightDataItem>
            <DarkDataItem>450 OMN</DarkDataItem>
          </DataRow>
          <DataRow>
            <LightDataItem>Omen Account</LightDataItem>
            <DarkDataItem>450 OMN</DarkDataItem>
          </DataRow>
          <DataRow>
            <LightDataItem>Omen Account</LightDataItem>
            <DarkDataItem>450 OMN</DarkDataItem>
          </DataRow>
        </ModalMain>
        <ButtonSection>
          <ButtonsLockUnlock buttonType={ButtonType.primaryLine}>Unlock Omen</ButtonsLockUnlock>
          <ButtonsLockUnlock buttonType={ButtonType.primaryAlternative}>Lock OMN</ButtonsLockUnlock>
        </ButtonSection>
      </ContentWrapper>
    </Modal>
  )
}

export const ModalLockYoTokens = withTheme(ModalLockTokens)
