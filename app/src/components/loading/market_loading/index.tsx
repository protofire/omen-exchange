import React from 'react'
import styled from 'styled-components'

import { SectionTitle, ViewCard } from '../../common'
import { InlineLoading } from '../inline_loading'

const LoadingCard = styled(ViewCard)`
  min-height: 500px;
`

interface Props {
  goBackEnabled?: boolean
  title: string
}

export const MarketLoading: React.FC<Props> = props => {
  const { goBackEnabled = true, title } = props

  return (
    <>
      <SectionTitle goBackEnabled={goBackEnabled} title={title ? title : 'Loading...'} />
      <LoadingCard>
        <InlineLoading />
      </LoadingCard>
    </>
  )
}
