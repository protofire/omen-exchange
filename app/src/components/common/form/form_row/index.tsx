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
}

export const FormRow = (props: Props) => {
  const { error = undefined, extraTitle = null, formField, note = undefined, title = undefined, ...restProps } = props
  return (
    <FormRowWrapper {...restProps}>
      <TitleWrapper>
        {title && <FormLabel>{title}</FormLabel>}
        {extraTitle}
      </TitleWrapper>
      {formField}
      {note && <FormRowNote>{note}</FormRowNote>}
      {error && <Error>{error}</Error>}
    </FormRowWrapper>
  )
}
