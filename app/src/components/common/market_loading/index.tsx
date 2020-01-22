import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'
import { Spinner } from '../spinner'

const MarketLoadingStyled = styled.div`
  align-items: center;
  background-color: rgba(255, 255, 255, 0.75);
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: center;
  left: 0;
  position: fixed;
  top: 0;
  width: 100vw;
  z-index: 100;
`
const Message = styled.p`
  color: #333;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
  margin: 0 auto;
  max-width: 100%;
  padding: 10px ${props => props.theme.paddings.mainPadding} 0;
  text-align: center;
  width: 480px;
`

interface MarketLoadingProps extends HTMLAttributes<HTMLDivElement> {
  message?: string
}

export const MarketLoading: React.FC<MarketLoadingProps> = (props: MarketLoadingProps) => {
  const { message = 'Loading...', ...restProps } = props

  return (
    <MarketLoadingStyled {...restProps}>
      <Spinner />
      {message ? <Message>{message}</Message> : null}
    </MarketLoadingStyled>
  )
}
