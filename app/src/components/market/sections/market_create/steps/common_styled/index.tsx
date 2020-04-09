import styled, { css } from 'styled-components'

import { Button, ButtonContainer } from '../../../../../button'

export const LeftButton = styled(Button)`
  margin-right: auto;
`

const ButtonWithReadyToGoStatusCSS = css`
  &,
  &:hover {
    background-color: ${props => props.theme.colors.primary};
    border-color: ${props => props.theme.colors.primary};
    color: #fff;
    font-weight: 500;
  }
`

export const ButtonWithReadyToGoStatus = styled(Button)<{ readyToGo: boolean }>`
  ${props => props.readyToGo && ButtonWithReadyToGoStatusCSS}
`

export const ButtonContainerFullWidth = styled(ButtonContainer)`
  margin-left: -${props => props.theme.cards.paddingHorizontal};
  margin-right: -${props => props.theme.cards.paddingHorizontal};
  padding-left: ${props => props.theme.cards.paddingHorizontal};
  padding-right: ${props => props.theme.cards.paddingHorizontal};
`

export const OutcomesTableWrapper = styled.div`
  border-bottom: 1px solid ${props => props.theme.borders.borderColor};
  border-top: 1px solid ${props => props.theme.borders.borderColor};
  margin-bottom: 20px;
  margin-left: -${props => props.theme.cards.paddingHorizontal};
  margin-right: -${props => props.theme.cards.paddingHorizontal};
  min-height: 180px;
  overflow-x: auto;
`

export const OutcomesTable = styled.table`
  border-collapse: collapse;
  min-width: 100%;
`

export const OutcomesTHead = styled.thead``

export const OutcomesTBody = styled.tbody``

export const OutcomesTH = styled.th<{ textAlign?: string }>`
  border-bottom: 1px solid ${props => props.theme.borders.borderColor};
  color: ${props => props.theme.colors.textColor};
  font-size: 14px;
  font-weight: 400;
  height: 40px;
  line-height: 1.2;
  padding: 0 15px 0 0;
  text-align: ${props => props.textAlign};
  white-space: nowrap;
`

OutcomesTH.defaultProps = {
  textAlign: 'left',
}

export const OutcomesTR = styled.tr`
  height: fit-content;

  &:last-child > td {
    border-bottom: none;
  }

  > th:first-child,
  > td:first-child {
    padding-left: ${props => props.theme.cards.paddingHorizontal};
  }

  > th:last-child,
  > td:last-child {
    padding-right: ${props => props.theme.cards.paddingHorizontal};
  }
`

export const OutcomesTD = styled.td<{ textAlign?: string }>`
  border-bottom: 1px solid ${props => props.theme.borders.borderColor};
  color: ${props => props.theme.colors.textColorDark};
  font-size: 14px;
  font-weight: 500;
  height: 56px;
  line-height: 1.2;
  padding: 0 15px 0 0;
  text-align: ${props => props.textAlign};
  white-space: nowrap;
`

OutcomesTH.defaultProps = {
  textAlign: 'left',
}

export const OutcomeItemTextWrapper = styled.div`
  align-items: center;
  display: flex;
`

export const OutcomeItemText = styled.div`
  color: ${props => props.theme.colors.textColorDark};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  margin: 0 0 0 16px;
  text-align: left;
  white-space: nowrap;
`

export const OutcomeItemLittleBallOfJoyAndDifferentColors = styled.div<{ outcomeIndex: number }>`
  background-color: ${props => props.theme.outcomes.colors[props.outcomeIndex].medium};
  width: 12px;
  height: 12px;
  border-radius: 50%;
`

export const OutcomeItemProbability = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`

export const OutcomeItemProbabilityText = styled.div`
  margin: 0 25px 0 0;
`

export const ErrorsWrapper = styled.div`
  margin: 0 0 20px;
`

export const TDFlexDiv = styled.div<{ textAlign?: string }>`
  align-items: center;
  display: flex;
  justify-content: ${props =>
    props.textAlign && 'right' ? 'flex-end' : props.textAlign && 'center' ? 'center' : 'flex-start'};
`
