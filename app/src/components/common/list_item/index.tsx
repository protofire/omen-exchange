import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'
import { MarketAndQuestion } from '../../../util/types'
import { CalendarIcon } from '../calendar_icon'
import { ChevronRightIcon } from '../chevron_right_icon'

const ListItemWrapper = styled.div``

const Chevron = styled.div``

const Contents = styled.div``

const Title = styled.h1``

const Info = styled.div``

const ResolutionDate = styled.span``

const Bold = styled.span``

const ResolutionText = styled.span``

const Separator = styled.span``

const Status = styled.span``

interface Props extends HTMLAttributes<HTMLDivElement> {
  data: MarketAndQuestion
}

export const ListItem: React.FC<Props> = (props: Props) => {
  const { data, ...restProps } = props
  return (
    <ListItemWrapper {...restProps}>
      <Contents>
        <Title>{data.question}</Title>
        <Info>
          <ResolutionDate>
            <CalendarIcon />
            <Bold>Resolution Date:</Bold>
            <ResolutionText>{/*data.resolution*/}</ResolutionText>
            <Separator>-</Separator>
            <Status>{data.marketStatus}</Status>
          </ResolutionDate>
        </Info>
      </Contents>
      <Chevron>
        <ChevronRightIcon />
      </Chevron>
    </ListItemWrapper>
  )
}
