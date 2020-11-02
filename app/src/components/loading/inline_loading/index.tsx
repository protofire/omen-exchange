import React, { HTMLAttributes } from 'react'
import styled, { css } from 'styled-components'

import { Spinner } from '../../common/spinner'

const FlexCSS = css`
  align-items: center;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: center;
`

const AbsoluteCSS = css`
  left: 0;
  position: absolute;
  top: 0;
  z-index: 100;
`

const Wrapper = styled.div<{ absolute?: boolean }>`
  background-color: rgba(255, 255, 255, 0.06);
  height: 100%;
  width: 100%;

  ${props => (props.absolute ? AbsoluteCSS : '')}
  ${props => (!props.absolute ? FlexCSS : '')}
`

const Message = styled.p`
  color: #86909e;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.4px;
  line-height: 1.5;
  margin: 0;
  max-width: 100%;
  padding: 24px 30px 0;
  text-align: center;
  width: 100%;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  absolute?: boolean
  message?: string
  big?: boolean | undefined
}

export const InlineLoading: React.FC<Props> = (props: Props) => {
  const { big, message = 'Loading...', ...restProps } = props

  return (
    <Wrapper {...restProps}>
      <Spinner big={big} />
      {message ? <Message>{message}</Message> : null}
    </Wrapper>
  )
}
