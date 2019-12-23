import React from 'react'
import styled from 'styled-components'
import { Button } from '../button'
import { ButtonComponentProps } from '../../../common/button_styling_types'
import IconAdd from './img/add-button.svg'

interface ButtonComponentPropsLocal extends ButtonComponentProps {
  disabled?: boolean
}

const ButtonContainer = styled(Button)`
  background-color: transparent;
  background-image: url(${IconAdd});
  background-position: 50% 50%;
  background-repeat: no-repeat;
  border: none;
  height: 25px;
  width: 26px;

  &:hover {
    background-color: transparent;
  }

  &:active {
    opacity: 0.5;
  }
`

export const ButtonAdd: React.FC<ButtonComponentPropsLocal> = (
  props: ButtonComponentPropsLocal,
) => {
  const { disabled = false, onClick, ...restProps } = props

  return <ButtonContainer disabled={disabled} onClick={onClick} type="button" {...restProps} />
}
