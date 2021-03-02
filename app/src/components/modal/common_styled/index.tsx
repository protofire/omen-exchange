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
