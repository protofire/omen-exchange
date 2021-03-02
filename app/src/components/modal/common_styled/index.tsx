import styled from 'styled-components'

export const ContentWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
`

export const ModalNavigation = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between
  width: 100%;
  padding: 5px;
  margin-bottom: 14px;
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

  &:nth-child(3) {
    margin-top: 16px;
  }
`

export const BalanceSection = styled.div`
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
`

export const BalanceItems = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

export const BalanceItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  &:nth-of-type(2) {
    margin-top: 12px;
  }
`

export const BalanceItemSide = styled.div`
  display: flex;
  align-items: center;
`

export const BalanceItemTitle = styled.p`
  font-size: ${props => props.theme.fonts.defaultSize};
  color: ${props => props.theme.colors.textColorDark};
  margin: 0;
`

export const BalanceItemBalance = styled.p`
  font-size: ${props => props.theme.fonts.defaultSize};
  color: ${props => props.theme.colors.textColorLighter};
  margin: 0;
`
