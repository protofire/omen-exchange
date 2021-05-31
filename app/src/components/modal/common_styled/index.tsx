import styled from 'styled-components'

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

export const ModalTitle = styled.p`
  font-size: 16px;
  color: ${props => props.theme.colors.textColorDark};
  font-weight: 500;
  margin: 0;
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

export const BalanceItemTitle = styled.p<{ notSelected?: boolean }>`
  font-size: ${props => props.theme.fonts.defaultSize};
  color: ${props => (props.notSelected ? props.theme.colors.textColorLighter : props.theme.colors.textColorDark)};
  margin: 0;
  text-transform: capitalize;
`

export const BalanceItemBalance = styled.p`
  font-size: ${props => props.theme.fonts.defaultSize};
  color: ${props => props.theme.colors.textColorLighter};
  margin: 0;
`
export const BalanceItem = styled.div<{ hover?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  &:not(:first-child){
    margin-top: 14px;
  }

  &:hover {
    
   ${BalanceItemSide}{
   ${BalanceItemTitle}{
   color: ${props => props.theme.colors.textColorDark}; !important;
   }
 
   }
  }
`
