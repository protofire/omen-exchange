import styled from 'styled-components'

import { TYPE } from '../../../theme'

export const ContentWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
`

export const ModalNavigation = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 5px;
  margin-bottom: 14px;
`

export const ModalNavigationLeft = styled.div`
  display: flex;
  align-items: center;
`

export const ModalCard = styled.div`
  width: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  border: ${props => props.theme.borders.borderLineDisabled};
  border-radius: ${props => props.theme.cards.borderRadius};

  &:nth-child(3),
  &:nth-child(4) {
    margin-top: 16px;
  }
`

export const BalanceSection = styled.div<{ borderBottom?: boolean }>`
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  ${props => props.borderBottom && `border-bottom: ${props.theme.borders.borderLineDisabled};`}};
`

export const BalanceItems = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

export const BalanceItemSide = styled.div`
  display: flex;
  align-items: center;
`

export const ModalTitle = styled(TYPE.heading3)`
  color: ${props => props.theme.text1};
`

export const ModalSubtitle = styled(TYPE.bodyRegular)`
  color: ${props => props.theme.text2};
`

export const BalanceItemTitle = styled(TYPE.bodyRegular)<{ selected?: boolean }>`
  color: ${props => (props.selected ? props.theme.text1 : props.theme.text2)};
`

export const BalanceItemBalance = styled(TYPE.bodyRegular)`
  color: ${props => props.theme.text2};
`

export const BalanceItem = styled.div<{ hover?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  &:not(:first-child) {
    margin-top: 14px;
  }

  &:hover {
   ${BalanceItemSide}{
   ${BalanceItemTitle}{
    color: ${props => props.theme.text1}; !important;
   }
   }
  }
`
