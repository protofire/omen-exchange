import React from 'react'

import { Kleros } from '../advanced_filters/img/kleros'

interface Props {
  id: Maybe<string>
}

export const ArbitratorIcon = ({ id }: Props) => {
  switch (id) {
    case 'kleros':
      return <Kleros />
    default:
      return null
  }
}
