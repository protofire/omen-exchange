import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

import { FormError } from '../form_error'
import { FormLabel } from '../form_label'
import { FormRowNote } from '../form_row_note'

const FormRowWrapper = styled.div`
  margin-bottom: 20px;
  position: relative;
  z-index: 1;

  &:last-child {
    margin-bottom: 0;
  }
`

const TitleWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
`

const Error = styled(FormError)`
  margin-top: 10px;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  error?: any
  formField: any
  note?: any
  title?: string | undefined
  extraTitle?: any
  style?: React.CSSProperties
}

export const FormRow = (props: Props) => {
  const {
    error = undefined,
    extraTitle = null,
    formField,
    note = undefined,
    style,
    title = undefined,
    ...restProps
  } = props
  return (
    <FormRowWrapper {...restProps} style={{ marginTop: 20, ...(style || {}) }}>
      {(title || extraTitle) && (
        <TitleWrapper>
          {title && <FormLabel>{title}</FormLabel>}
          {extraTitle}
        </TitleWrapper>
      )}
      {formField}
      {note && <FormRowNote>{note}</FormRowNote>}
      {error && <Error>{error}</Error>}
    </FormRowWrapper>
  )
}
