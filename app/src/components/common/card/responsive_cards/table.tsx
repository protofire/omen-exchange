import React from 'react'
import styled from 'styled-components'

import { TYPE } from '../../../../theme'
import { ButtonStateful } from '../../../button/button_stateful'
import { ButtonType } from '../../../button/button_styling_types'
import { CardCSS } from '../index'

const CardStyled = styled.div`
  ${CardCSS};
  box-shadow: none;
  width: fit-content;
  display: flex;
  flex-direction: row;
  gap: 48px;
  margin-top: 32px;
  padding: 24px 32px;
  justify-content: space-between;
  //div:nth-child(3) {
  //  border-right: 1px solid #e8eaf6;
  //  padding-right: 64px;
  //  margin-right: 16px;
  //  gap: 0;
  //}
  //mobile
  @media (max-width: ${props => props.theme.themeBreakPoints.xl}) {
    flex-direction: column;
    width: 100%;
    gap: 10px;
    padding: 20px;
    margin-top: 24px;
  }
`
const ItemWrapper = styled.div`
  > div:nth-child(2) {
    margin-top: 8px;
    @media (max-width: ${props => props.theme.themeBreakPoints.xl}) {
      margin-top: 0px;
    }
  }
  @media (max-width: ${props => props.theme.themeBreakPoints.xl}) {
    display: flex;
    justify-content: space-between;
  }
`
const DataWrapper = styled.div`
  display: flex;
  align-items: center;
`

interface Props {
  valueObject: any
  style?: any
  hasButton?: boolean
}
export const Table: React.FC<Props> = (props: Props) => {
  const { hasButton = false, valueObject, ...restProps } = props

  return (
    <CardStyled {...restProps}>
      {valueObject.map((item: any) => {
        return (
          <ItemWrapper key={item}>
            <TYPE.bodyRegular color={'text2'}>{item[0]}</TYPE.bodyRegular>
            <DataWrapper>
              <TYPE.bodyMedium color={'text1'}>{item[1].text} </TYPE.bodyMedium>
              {item[1]['icon'] !== undefined && <div style={{ marginLeft: '8px' }}> {item[1].icon}</div>}
            </DataWrapper>
          </ItemWrapper>
        )
      })}
      {hasButton && (
        <ButtonStateful buttonType={ButtonType.primary} style={{ alignSelf: 'center' }}>
          Claim Rewards
        </ButtonStateful>
      )}
    </CardStyled>
  )
}
