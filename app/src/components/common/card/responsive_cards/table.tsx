import React from 'react'
import styled from 'styled-components'

import { TYPE } from '../../../../theme'
import { CardCSS } from '../index'

const CardStyled = styled.div`
  ${CardCSS};
  box-shadow: none;
  width: fit-content;
  display: flex;
  flex-direction: row;
  gap: 48px;
  padding: 24px 32px;
  justify-content: space-between;
  //mobile
  @media (max-width: ${props => props.theme.themeBreakPoints.xl}) {
    flex-direction: column;
    width: 100%;
    gap: 10px;
    padding: 20px;
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
}
export const Table: React.FC<Props> = (props: Props) => {
  const { valueObject, ...restProps } = props

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
    </CardStyled>
  )
}
