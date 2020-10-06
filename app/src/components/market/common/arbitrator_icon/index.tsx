import React from 'react'

import { DxDao } from '../advanced_filters/img/dxDao'

interface Props {
  id: Maybe<string>
}

export const ArbitratorIcon = ({ id }: Props) => {
  switch (id) {
    case 'kleros':
      return <DxDao />
    default:
      return null
  }
}
