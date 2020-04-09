import React, { HTMLAttributes } from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'

import { Card, Spinner } from '../../common'

const Wrapper = styled.div`
  align-items: center;
  background-color: rgba(0, 0, 0, 0.06);
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

const LoadingCard = styled(Card)`
  align-items: center;
  height: 200px;
  justify-content: center;
  width: 280px;
`

const LoadingSpinner = styled(Spinner)`
  align-self: center;
  margin-top: auto;
`

const Message = styled.p`
  color: ${props => props.theme.colors.textColorDark};
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.4px;
  line-height: 1.5;
  margin: auto 0 0 0;
  max-width: 100%;
  text-align: center;
  width: 100%;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  message?: string
}

export const FullLoading: React.FC<Props> = (props: Props) => {
  const { message, ...restProps } = props
  const portal: any = document.getElementById('portalContainer')

  return ReactDOM.createPortal(
    <Wrapper {...restProps}>
      <LoadingCard>
        <LoadingSpinner />
        {message ? <Message>{message}</Message> : null}
      </LoadingCard>
    </Wrapper>,
    portal,
  )
}
