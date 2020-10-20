import React from 'react'
import styled from 'styled-components'

import { IconAlert, IconVerified } from '../../../common/icons'

const Wrapper = styled.span<{ verified: boolean }>`
  display: flex;
  align-items: center;
  color: ${({ theme, verified }) => (verified ? theme.colors.textColorLighter : theme.colors.alert)};
  & > * + * {
    margin-left: 8px;
  }
`

interface Props {
  label?: string
}

export const VerifiedRow = (props: Props) => {
  const { label } = props
  const notVerified = !label

  return (
    <Wrapper verified={!notVerified}>
      {notVerified ? <IconAlert /> : <IconVerified />}
      <span>{notVerified ? 'None' : label}</span>
    </Wrapper>
  )
}
