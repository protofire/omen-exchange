import moment from 'moment-timezone'
import React, { DOMAttributes } from 'react'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'

import { formatDate } from '../../../../util/tools'

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 0px;
`

const Title = styled.h2`
  color: ${props => props.theme.colors.textColorDarker};
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  margin: 0 5px 0 0;
  white-space: nowrap;
`

const Value = styled.a`
  color: ${props => props.theme.colors.textColor};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  margin: 0;
  text-align: right;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`

interface Props extends DOMAttributes<HTMLDivElement> {
  title: string
  value: any
  questionId?: string
}

export const DisplayResolution: React.FC<Props> = (props: Props) => {
  const { questionId, title, value, ...restProps } = props

  const now = moment()
  const localResolution = moment(value).local()

  //create message for when the market ends
  const endDate = value
  const endsText = moment(endDate).fromNow()
  const endsMessage = moment(endDate).isAfter(now) ? `Ends ${endsText}` : `Ended ${endsText}`

  //create message for local time
  const tzName = moment.tz.guess()
  const abbr = moment.tz(tzName).zoneAbbr()
  const formatting = `MMMM Do YYYY - HH:mm:ss [${abbr}]`

  const windowObj: any = window
  const realitioBaseUrl =
    windowObj.ethereum && windowObj.ethereum.isMetaMask ? 'https://reality.eth' : 'https://reality.eth.link'

  const realitioUrl = questionId ? `${realitioBaseUrl}/app/#!/question/${questionId}` : `${realitioBaseUrl}/`

  return (
    <Wrapper {...restProps}>
      <Title>{title}</Title>
      <Value
        data-delay-hide="500"
        data-effect="solid"
        data-for="walletBalanceTooltip"
        data-multiline="true"
        data-tip={localResolution.format(formatting) + '<br />' + endsMessage}
        href={realitioUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        {formatDate(value)}
      </Value>
      <ReactTooltip id="walletBalanceTooltip" />
    </Wrapper>
  )
}
