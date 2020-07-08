import { Block } from 'ethers/providers'
import { BigNumber } from 'ethers/utils'

import { Outcome } from '../components/market/sections/market_create/steps/outcomes'

export enum Status {
  Ready = 'Ready',
  Loading = 'Loading',
  Refreshing = 'Refreshing',
  Done = 'Done',
  Error = 'Error',
}

export interface BalanceItem {
  outcomeName: string
  probability: number
  currentPrice: number
  shares: BigNumber
  payout: number
  holdings: BigNumber
}

export enum Stage {
  Running = 0,
  Paused = 1,
  Closed = 2,
}

export interface TokenAmountInterface {
  amount: BigNumber
  decimals: number
  format: (precision?: number) => string
  interestRate?: number
  price?: number
  depositBalance?: TokenAmountInterface
  walletBalance?: TokenAmountInterface
}

export enum StepProfile {
  View = 'View',
  Buy = 'Buy',
  Sell = 'Sell',
  CloseMarketDetail = 'CloseMarketDetail',
}

export interface Question {
  id: string
  raw: string
  templateId: number
  title: string
  resolution: Date
  arbitratorAddress: string
  category: string
  outcomes: string[]
}

export enum OutcomeTableValue {
  OutcomeProbability = 'Outcome/Probability',
  CurrentPrice = 'Price',
  Shares = 'My Shares',
  Payout = 'Payout',
  Outcome = 'Outcome',
  Probability = 'Probability',
}

export interface Token {
  address: string
  decimals: number
  symbol: string
  image?: string
}

export interface QuestionLog {
  category: string
  lang: string
  title: string
  type: string
  outcomes?: string[]
}

export interface Market {
  address: string
  ownerAddress: string
  collateralTokenAddress: string
  conditionId: string
}

export enum MarketStatus {
  Open = 'Open',
  Closed = 'Closed',
}

export type MarketWithExtraData = Market & {
  fee: BigNumber
  question: Question
  status: MarketStatus
}

export interface Log {
  topics: Array<string>
  data: string
}

export interface Arbitrator {
  address: string
  id: KnownArbitrator
  isSelectionEnabled: boolean
  name: string
  url: string
}

export enum Wallet {
  MetaMask = 'MetaMask',
  WalletConnect = 'WalletConnect',
}

export interface MarketData {
  collateral: Token
  arbitratorsCustom: Arbitrator[]
  categoriesCustom: string[]
  question: string
  category: string
  resolution: Date | null
  arbitrator: Arbitrator
  spread: number
  funding: BigNumber
  outcomes: Outcome[]
  loadedQuestionId: Maybe<string>
}

export enum MarketStates {
  open = 'OPEN',
  pending = 'PENDING',
  closed = 'CLOSED',
  myMarkets = 'MY_MARKETS',
}

export type MarketsSortCriteria =
  | 'collateralVolume'
  | 'creationTimestamp'
  | 'openingTimestamp'
  | 'liquidityParameter'
  | 'lastActiveDayAndRunningDailyVolume'

export interface MarketFilters {
  state: MarketStates
  category: string
  title: Maybe<string>
  sortBy: Maybe<MarketsSortCriteria>
  sortByDirection: 'desc' | 'asc'
  arbitrator: Maybe<string>
  templateId: Maybe<string>
  currency: Maybe<string>
}

export interface MarketMakerData {
  address: string
  answerFinalizedTimestamp: Maybe<BigNumber>
  arbitrator: Arbitrator
  balances: BalanceItem[]
  collateral: Token
  fee: BigNumber
  isConditionResolved: boolean
  isQuestionFinalized: boolean
  collateralVolume: BigNumber
  marketMakerFunding: BigNumber
  marketMakerUserFunding: BigNumber
  payouts: Maybe<number[]>
  question: Question
  totalEarnings: BigNumber
  totalPoolShares: BigNumber
  userEarnings: BigNumber
  userPoolShares: BigNumber
}

export enum Ternary {
  True,
  False,
  Unknown,
}

export type HistoricDataPoint = {
  block: Block
  holdings: string[]
}

export type HistoricData = HistoricDataPoint[]
export type Period = '1H' | '1D' | '1W' | '1M'
