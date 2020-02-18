import React from 'react'
import styled from 'styled-components'
import { Textfield } from '../textfield'
import SearchIconSVG from './img/search-solid.svg'

interface Props {
  value: string
  name: string
  placeholder: string
}

const Icon = styled.div`
  background-image: url(${SearchIconSVG});
  background-position: 50% 50%;
  background-repeat: no-repeat;
  background-size: contain;
  height: 16px;
  width: 16px;
  position: absolute;
  right: 24px;
  bottom: 8px;
`

export const SearchInput = (props: Props) => {
  const { value, name = 'search', placeholder = 'Market Name' } = props

  return (
    <>
      <Textfield name={name} placeholder={placeholder} type="text" value={value} />
      <Icon />
    </>
  )
}
