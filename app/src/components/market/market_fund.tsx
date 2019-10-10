import React, { FC } from 'react'

interface Props {
  marketAddress: string
}

const MarketFund: FC<Props> = props => {
  return <>Market fund address {props.marketAddress}</>
}

export { MarketFund }
