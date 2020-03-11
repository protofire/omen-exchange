import React, { HTMLAttributes } from 'react'
import { useHistory } from 'react-router-dom'
import { useLastLocation } from 'react-router-last-location'
import styled from 'styled-components'

import { ButtonCircle } from '../button_circle'
import { IconArrowBack } from '../icons/IconArrowBack'

const SectionTitleWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  margin: 0 auto 18px auto;
  max-width: 100%;
  width: ${props => props.theme.mainContainer.maxWidth};
`

const Text = styled.h1<{ goBackEnabled: boolean }>`
  color: #333;
  flex-grow: 1;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.2;
  margin: 0;
  padding-left: 25px;
  padding-right: ${props => (props.goBackEnabled ? `${parseInt(props.theme.buttonCircle.dimensions + 25)}px` : '25px')};
  text-align: center;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  goBackEnabled?: boolean
  title: string
}

export const SectionTitle: React.FC<Props> = (props: Props) => {
  const { goBackEnabled = false, title, ...restProps } = props
  const lastLocation = useLastLocation()
  const history = useHistory()
  const enableGoBack = (lastLocation && goBackEnabled) || false

  return (
    <SectionTitleWrapper {...restProps}>
      {enableGoBack && (
        <ButtonCircle onClick={history.goBack}>
          <IconArrowBack />
        </ButtonCircle>
      )}
      <Text goBackEnabled={enableGoBack}>{title}</Text>
    </SectionTitleWrapper>
  )
}
