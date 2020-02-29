import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

import { FormError } from '../form_error'
import { FormLabel } from '../form_label'
import { FormRowNote } from '../form_row_note'
import { Tooltip } from '../tooltip'

const FormRowWrapper = styled.div`
  margin-bottom: 25px;
  position: relative;
  z-index: 1;
`

const TooltipStyled = styled(Tooltip)`
  margin-left: auto;
`

const TitleWrapper = styled.div`
  align-items: center;
  display: flex;
  margin-bottom: 14px;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  error?: any
  formField: any
  note?: any
  title?: string
  tooltip?: {
    id: string
    description: string
  }
}

export const FormRow = (props: Props) => {
  const { error, formField, note, title, tooltip, ...restProps } = props
  return (
    <FormRowWrapper {...restProps}>
      <TitleWrapper>
        {title ? <FormLabel>{title}</FormLabel> : null}
        {tooltip ? <TooltipStyled description={tooltip.description} id={tooltip.id} /> : null}
      </TitleWrapper>
      {formField}
      {note ? <FormRowNote>{note}</FormRowNote> : null}
      {error ? <FormError>{error}</FormError> : null}
    </FormRowWrapper>
  )
}
