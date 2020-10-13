import React, { HTMLAttributes, useState } from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
`

const Image = styled.img`
  align-items: center;
  display: flex;
  height: 100%;
  margin-right: 8px;
  max-height: 24px;
  max-width: 24px;
`

const Text = styled.div`
  line-height: 1.2;
  overflow: hidden;
  white-space: nowrap;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  image: any
  text: string
}

export const TokenItem: React.FC<Props> = props => {
  const { image, text } = props
  const [showImage, setShowImage] = useState(true)

  return (
    <Wrapper>
      {showImage && <Image onError={() => setShowImage(false)} src={image} />}
      <Text>{text}</Text>
    </Wrapper>
  )
}
