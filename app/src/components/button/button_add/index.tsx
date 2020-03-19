import React from 'react'
import styled from 'styled-components'

import { Button } from '../button'
import { ButtonProps } from '../button_styling_types'

import IconAdd from './img/add-button.svg'

const Wrapper = styled(Button)`
  background-color: transparent;
  background-image: url(${IconAdd});
  background-position: 50% 50%;
  background-repeat: no-repeat;
  border: none;
  height: 25px;
  padding: 0;
  width: 26px;

  &:hover {
    background-color: transparent;
  }

  &:active {
    opacity: 0.5;
  }
`

export const ButtonAdd: React.FC<ButtonProps> = (props: ButtonProps) => <Wrapper type="button" {...props} />
