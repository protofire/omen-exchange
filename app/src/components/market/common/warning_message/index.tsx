import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

import { Alert } from './img/Alert'

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-radius: 4px;
  border: 1px solid ${props => props.theme.borders.borderColorLighter};
  margin-top: 20px;
  align-content: center;
  padding: 4px 20px;
`

const AlertWrapper = styled.div`
  align-items: center;
  display: flex;
  padding-right: 16px;
`

const Description = styled.p`
  color: ${props => props.theme.colors.textColorLightish};
  font-size: 14px;
  line-height: 1.4;
  letter-spacing: 0.4px;
`

const Hyperlink = styled.a`
  color: ${props => props.theme.colors.primaryLight};
`

type Props = HTMLAttributes<HTMLDivElement>

export const WarningMessage: React.FC<Props> = (props: Props) => {
  const { ...restProps } = props

  return (
    <Wrapper {...props}>
      <AlertWrapper>
        <Alert />
      </AlertWrapper>
      <Description>
        Providing liquidity is risky and could result in near total loss. It is important to withdraw liquidity before
        the event occurs and to be aware the market could move abruptly at any time.{' '}
        <Hyperlink href="./faq.pdf" target="_blank">
          More Info
        </Hyperlink>
      </Description>
    </Wrapper>
  )
}
