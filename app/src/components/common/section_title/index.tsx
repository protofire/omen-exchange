import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

const SectionTitleWrapper = styled.div`
  margin: 0 0 35px 0;
  padding: 0 15px;
`

const SectionTitleText = styled.h1`
  color: #000;
  font-size: 26px;
  font-weight: 500;
  line-height: 1.3;
  margin: 0;
  text-align: center;
`

const SectionSubTitle = styled.h2`
  color: #555;
  font-size: 20px;
  font-weight: 500;
  line-height: 1.3;
  margin: 0;
  text-align: center;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  title: string
  subTitle?: string
}

export const SectionTitle: React.FC<Props> = (props: Props) => {
  const { title, subTitle = '', ...restProps } = props

  return (
    <SectionTitleWrapper {...restProps}>
      <SectionTitleText>{title}</SectionTitleText>
      {subTitle ? <SectionSubTitle>{subTitle}</SectionSubTitle> : null}
    </SectionTitleWrapper>
  )
}
