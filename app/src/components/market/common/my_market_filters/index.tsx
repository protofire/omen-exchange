import React, { DOMAttributes } from 'react'
import styled from 'styled-components'

const FilterAddressWrapper = styled.div`
  width: 100%;
`
interface Props extends DOMAttributes<HTMLDivElement> {
  value?: any
}

export const MyMarketFilters: React.FC<Props> = props => {
  const { value, ...restProps } = props
  return <FilterAddressWrapper>Address</FilterAddressWrapper>
}
