import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

const FormRowNoteWrapper = styled.div`
  color: #666;
  font-size: 11px;
  font-weight: normal;
  line-height: 1.45;
  margin: 5px 0 0 0;
  text-align: left;
`

interface Props extends HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
}

export const FormRowNote = (props: Props) => {
  const { children, ...restProps } = props

  return <FormRowNoteWrapper {...restProps}>{children}</FormRowNoteWrapper>
}
