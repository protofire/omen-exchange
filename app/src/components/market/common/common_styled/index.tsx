import styled from 'styled-components'

import { getOutcomeColor } from '../../../../theme/utils'
import { Button, ButtonContainer } from '../../../button'

export const LeftButton = styled(Button)`
  margin-right: auto;
`

export const ButtonContainerFullWidth = styled(ButtonContainer)`
  margin-left: -${props => props.theme.cards.paddingHorizontal};
  margin-right: -${props => props.theme.cards.paddingHorizontal};
  padding-left: ${props => props.theme.cards.paddingHorizontal};
  padding-right: ${props => props.theme.cards.paddingHorizontal};
`

export const OutcomesTableWrapper = styled.div`
  margin-left: -${props => props.theme.cards.paddingHorizontal};
  margin-right: -${props => props.theme.cards.paddingHorizontal};
  min-height: 50px;
  overflow-x: auto;
  border-bottom: ${props => `1px solid ${props.theme.borders.borderColor}`};
  padding-bottom: 20px;
`

export const OutcomesTable = styled.table`
  border-collapse: collapse;
  min-width: 100%;
`

export const OutcomesTHead = styled.thead``

export const OutcomesTBody = styled.tbody``

export const OutcomesTH = styled.th<{ textAlign?: string }>`
  color: ${props => props.theme.colors.textColorDark};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  padding: 6px 15px 6px 0;
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
  color: ${props => props.theme.colors.textColorLighter};
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  padding: 6px 15px 6px 0;
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

export const RowWrapper = styled.div`
  align-items: center;
  display: flex;
`

export const OutcomeItemWrapper = styled.div<{ readOnly: boolean }>`
  align-items: center;
  display: flex;
  background-color: ${props => props.theme.textfield.backgroundColor};
  border-color: ${props => props.theme.textfield.borderColor};
  border-style: ${props => props.theme.textfield.borderStyle};
  border-width: ${props => props.theme.textfield.borderWidth};
  border-radius: ${props => props.theme.textfield.borderRadius};
  padding: 0 ${props => props.theme.textfield.paddingHorizontal};

  transition: border-color 0.15s ease-in-out;
  width: 100%;
  ${({ readOnly, theme }) =>
    !readOnly &&
    `&:hover {
           border-color: ${theme.textfield.borderColorOnHover};
         }

         &:active,
         &:focus {
           border-color: ${theme.textfield.borderColorActive};
         }`}
`

export const OutcomeItemText = styled.div`
  color: ${props => props.theme.colors.textColorLighter};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  text-align: left;
  white-space: nowrap;
`

export const OutcomeItemLittleBallOfJoyAndDifferentColors = styled.div<{ outcomeIndex: number }>`
  background-color: ${props => getOutcomeColor(props.outcomeIndex).medium};
  border-radius: 50%;
  height: 12px;
  margin: 0 16px 0 0;
  width: 12px;
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

export const GenericError = styled.p<{ margin?: string }>`
  color: ${props => props.theme.colors.error};
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
  margin: ${props => props.margin};
  padding: 0;
  text-align: left;
`

GenericError.defaultProps = {
  margin: '10px 0 0',
}

export const TDFlexDiv = styled.div<{ textAlign?: string }>`
  align-items: center;
  display: flex;
  justify-content: ${props =>
    props.textAlign && 'right' ? 'flex-end' : props.textAlign && 'center' ? 'center' : 'flex-start'};
`
export const SubsectionTitleActionWrapper = styled.div`
  align-items: center;
  display: flex;
  padding-top: 5px;
  width: 100%;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    margin-left: auto;
    padding-top: 0;
    width: auto;
  }
`
export const Breaker = styled.div`
  &::before {
    content: '|';
    margin: 0 10px;
    color: ${props => props.theme.colors.verticalDivider};
  }
  &:last-child {
    display: none;
  }
`
