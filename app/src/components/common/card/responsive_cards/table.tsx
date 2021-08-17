import React from 'react'
import styled from 'styled-components'

import { TYPE } from '../../../../theme'
import { ViewCard } from '../../../market/common_sections/view_card'
import { Card, CardCSS } from '../index'

const CardStyled = styled.div`
  ${CardCSS};
  width: fit-content;
  display: flex;
  flex-direction: row;
  gap: 48px;
  margin-top: 22px;
  padding: 24px 32px;
  //mobile
  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    flex-direction: column;
    width: 100%;
    gap: 10px;
    padding: 20px;
    margin-top: 24px;
  }
`
const ItemWrapper = styled.div`
  div:nth-child(2) {
    margin-top: 8px;
    @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
      margin-top: 0px;
    }
  }
  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    display: flex;
    justify-content: space-between;
  }
`

interface Props {
  valueObject: any
}
export const Table: React.FC<Props> = (props: Props) => {
  const { valueObject } = props

  return (
    <CardStyled>
      {valueObject.map((item: any) => {
        return (
          <ItemWrapper key={item}>
            <TYPE.bodyRegular color={'text2'}>{item[0]}</TYPE.bodyRegular>
            <TYPE.bodyMedium color={'text1'}>
              {item[1].text} {item[1]['icon'] !== undefined && item[1].icon}
            </TYPE.bodyMedium>
          </ItemWrapper>
        )
      })}
    </CardStyled>
  )
}
