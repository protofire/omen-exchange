import { BigNumber } from 'ethers/utils'
import React, { useState } from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { WhenConnected } from '../../../hooks/connectedWeb3'
import { formatBigNumber } from '../../../util/tools'
import { Arbitrator, BalanceItem, OutcomeTableValue, Status, Token } from '../../../util/types'
import { Button, ButtonContainer } from '../../button'
import { ButtonType } from '../../button/button_styling_types'
import {
  DisplayArbitrator,
  GridTwoColumns,
  SubsectionTitle,
  SubsectionTitleAction,
  SubsectionTitleWrapper,
  ThreeBoxComments,
  TitleValue,
  ViewCard,
} from '../../common'
import { OutcomeTable } from '../../common/outcome_table'
import { FullLoading } from '../../loading'

const LeftButton = styled(Button)`
  margin-right: auto;
`

interface Props extends RouteComponentProps<{}> {
  account: Maybe<string>
  balances: BalanceItem[]
  collateral: Token
  arbitrator: Maybe<Arbitrator>
  question: string
  questionId: string
  category: string
  status: Status
  marketMakerAddress: string
  funding: BigNumber
  lastDayVolume: Maybe<BigNumber>
  totalPoolShares: BigNumber
  userPoolShares: BigNumber
}

const ViewWrapper = (props: Props) => {
  const {
    arbitrator,
    balances,
    category,
    collateral,
    history,
    lastDayVolume,
    marketMakerAddress,
    questionId,
    status,
    totalPoolShares,
    userPoolShares,
  } = props
  const [showingExtraInformation, setExtraInformation] = useState(false)

  const toggleExtraInformation = () =>
    showingExtraInformation ? setExtraInformation(false) : setExtraInformation(true)

  const userHasShares = balances.some((balanceItem: BalanceItem) => {
    const { shares } = balanceItem
    return !shares.isZero()
  })

  const probabilities = balances.map(balance => balance.probability)

  const renderTableData = () => {
    const disabledColumns = [OutcomeTableValue.Payout]
    if (!userHasShares) {
      disabledColumns.push(OutcomeTableValue.Shares)
    }
    return (
      <OutcomeTable
        balances={balances}
        collateral={collateral}
        disabledColumns={disabledColumns}
        displayRadioSelection={false}
        probabilities={probabilities}
      />
    )
  }

  const details = (showExtraDetails: boolean) => {
    return (
      <>
        <GridTwoColumns>
          {category && <TitleValue title={'Category'} value={category} />}
          <TitleValue title={'Arbitrator'} value={arbitrator && <DisplayArbitrator arbitrator={arbitrator} />} />
          {questionId && (
            <TitleValue
              title={'Realitio'}
              value={
                <a
                  href={`https://realitio.github.io/#!/question/${questionId}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Question URL
                </a>
              }
            />
          )}
          <TitleValue
            title="24h Volume"
            value={lastDayVolume ? `${formatBigNumber(lastDayVolume, collateral.decimals)} ${collateral.symbol}` : '-'}
          />
          {showExtraDetails ? (
            <>
              <TitleValue
                title={'Total Pool Tokens'}
                value={totalPoolShares ? formatBigNumber(totalPoolShares, collateral.decimals) : '0'}
              />
              <TitleValue
                title={'My Pool Tokens'}
                value={userPoolShares ? formatBigNumber(userPoolShares, collateral.decimals) : '0'}
              />
              <TitleValue title={'Total Pool Earnings'} value={'Mocked Value 3'} />
              <TitleValue title={'My Earnings'} value={'Mocked Value 4'} />
            </>
          ) : null}
        </GridTwoColumns>
      </>
    )
  }

  const marketHasDetails = category || arbitrator

  return (
    <>
      <ViewCard>
        <SubsectionTitleWrapper>
          <SubsectionTitle>Market Information</SubsectionTitle>
          <SubsectionTitleAction onClick={toggleExtraInformation}>
            {showingExtraInformation ? 'Hide' : 'Show'} Pool Information
          </SubsectionTitleAction>
        </SubsectionTitleWrapper>
        {marketHasDetails && details(showingExtraInformation)}
        {renderTableData()}
        <WhenConnected>
          <ButtonContainer>
            <LeftButton
              buttonType={ButtonType.secondaryLine}
              onClick={() => {
                history.push(`${marketMakerAddress}/pool-liquidity`)
              }}
            >
              Pool Liquidity
            </LeftButton>
            <Button
              buttonType={ButtonType.secondaryLine}
              disabled={!userHasShares}
              onClick={() => {
                history.push(`${marketMakerAddress}/sell`)
              }}
            >
              Sell
            </Button>
            <Button
              buttonType={ButtonType.secondaryLine}
              onClick={() => {
                history.push(`${marketMakerAddress}/buy`)
              }}
            >
              Buy
            </Button>
          </ButtonContainer>
        </WhenConnected>
      </ViewCard>
      <ThreeBoxComments threadName={marketMakerAddress} />
      {status === Status.Loading && <FullLoading />}
    </>
  )
}

export const View = withRouter(ViewWrapper)
