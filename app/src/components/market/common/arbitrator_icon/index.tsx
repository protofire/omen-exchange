import React from 'react'

import { IconKleros } from '../../../common/icons'

interface Props {
  id: Maybe<string>
}

export const ArbitratorIcon = ({ id }: Props) => {
  switch (id) {
    case 'kleros':
      return <IconKleros />
    default:
      return null
  }
}
