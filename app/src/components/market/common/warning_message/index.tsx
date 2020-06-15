import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

import { Alert } from './img/Alert'

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-radius: 4px;
  border: 1px solid ${props => props.theme.borders.borderColorLighter};
  padding: 21px 0px;
  margin-top: 20px;
  align-content: center;
`

const AlertWrapper = styled.div`
  align-content: center;
`

const Description = styled.p`
  color: ${props => props.theme.colors.textColorLightish};
  font-size: 14px;
  letter-spacing: 0.2px;
  line-height: 1.4;
  margin: 0 14px 0 0;
`
type Props = HTMLAttributes<HTMLDivElement>

export const WarningMessage: React.FC<Props> = (props: Props) => {
  const { ...restProps } = props

  return (
    <Wrapper {...restProps}>
      <AlertWrapper>
        <Alert />
      </AlertWrapper>
      <Description>
        Providing liquidity is risky and could result in near total loss. It is important to withdraw liquidity before
        the event occurs and to be aware the market could move abruptly at any time. <a href="url">More Infos</a>
      </Description>
    </Wrapper>
  )
}
