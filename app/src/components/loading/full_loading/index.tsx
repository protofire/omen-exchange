import React, { HTMLAttributes } from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'

import { Spinner } from '../../common/spinner'

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

const Message = styled.p`
  color: #86909e;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.4px;
  line-height: 1.5;
  max-width: 100%;
  padding: 0 30px;
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
      <Spinner />
      {message ? <Message>{message}</Message> : null}
    </Wrapper>,
    portal,
  )
}
