import React from 'react'
import styled from 'styled-components'

import { Arbitrator } from '../../../../util/types'
import { ArbitratorIcon } from '../arbitrator_icon'

const AWrapper = styled.a`
  text-decoration: none !important;
  position: relative;
  & > * + * {
    margin-left: 8px;
  }
  &::after {
    position: absolute;
    content: ' ';
    left: 50%;
    width: 0;
    bottom: -5px;
    height: 1px;
    transition: all 0.4s;
    background-color: ${({ theme }) => theme.colors.darkGray};
  }
  &:hover {
    &::after {
      left: 0;
      width: 100%;
    }
  }
`

const Wrapper = styled.span`
  & > * + * {
    margin-left: 8px;
  }
`

interface Props {
  arbitrator: Arbitrator
}

export const DisplayArbitrator: React.FC<Props> = (props: Props) => {
  const { arbitrator } = props

  return (
    <>
      {arbitrator.url ? (
        <AWrapper href={arbitrator.url} rel="noopener noreferrer" target="_blank">
          <ArbitratorIcon id={arbitrator.id} />
          <span>{arbitrator.name}</span>
        </AWrapper>
      ) : (
        <Wrapper>
          <ArbitratorIcon id={arbitrator.id} />
          <span>{arbitrator.name}</span>
        </Wrapper>
      )}
    </>
  )
}
