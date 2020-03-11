import React, { HTMLAttributes } from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'

import { Spinner } from '../spinner'

const FullLoadingWrapper = styled.div`
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

const InnerLoadingWrapper = styled.div`
  align-items: center;
  background-color: rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 100;
`

const Message = styled.p`
  color: #86909e;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  margin: 0 auto;
  max-width: 100%;
  padding: 10px ${props => props.theme.paddings.mainPadding} 0;
  text-align: center;
  width: 480px;
`

interface LoadingProps {
  message?: string
}

const FullLoading = (props: LoadingProps) => {
  const { message = 'Loading...', ...restProps } = props

  return (
    <FullLoadingWrapper {...restProps}>
      <Spinner />
      {message ? <Message>{message}</Message> : null}
    </FullLoadingWrapper>
  )
}

const InnerLoading = (props: LoadingProps) => {
  const { message = 'Loading...', ...restProps } = props

  return (
    <InnerLoadingWrapper {...restProps}>
      <Spinner />
      {message ? <Message>{message}</Message> : null}
    </InnerLoadingWrapper>
  )
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  message?: string
  full?: boolean
}

export const Loading: React.FC<Props> = (props: Props) => {
  const { full, message, ...restProps } = props

  if (full) {
    const portal: any = document.getElementById('portalContainer')
    return ReactDOM.createPortal(<FullLoading message={message} {...restProps} />, portal)
  } else {
    return <InnerLoading message={message} {...restProps} />
  }
}
