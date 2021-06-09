import React, { HTMLAttributes, useState } from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
`

export const Image = styled.img<{ size: string }>`
  align-items: center;
  display: flex;
  height: 100%;
  margin-right: 8px;
  height: ${props => `${props.size}px`};
  width: ${props => `${props.size}px`};
  border-radius: 50%;
`

const Text = styled.div`
  line-height: 1.2;
  overflow: hidden;
  white-space: nowrap;
  color: ${props => props.theme.colors.textColorDark};
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  image?: any
  text: string
  imgSize?: string
}

export const TokenItem: React.FC<Props> = props => {
  const { image, imgSize = '22', text } = props
  const [showImage, setShowImage] = useState(true)

  return (
    <Wrapper>
      {!!image && showImage && <Image onError={() => setShowImage(false)} size={imgSize} src={image} />}
      <Text>{text}</Text>
    </Wrapper>
  )
}
