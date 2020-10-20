import Big from 'big.js'
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
  payout: Big
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
  isPendingArbitration: boolean
  arbitrationOccurred: boolean
  currentAnswerTimestamp: Maybe<BigNumber>
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
  volume?: string
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
  Authereum = 'Authereum',
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
  verifiedLabel?: string
  lowerBound: string
  upperBound: string
  startingPoint: string
  unit: string
}

export enum MarketStates {
  open = 'OPEN',
  pending = 'PENDING',
  finalizing = 'FINALIZING',
  arbitrating = 'ARBITRATING',
  closed = 'CLOSED',
  myMarkets = 'MY_MARKETS',
}

export type MarketsSortCriteria =
  | 'usdVolume'
  | 'creationTimestamp'
  | 'openingTimestamp'
  | 'usdLiquidityParameter'
  | 'lastActiveDayAndScaledRunningDailyVolume'
  | 'sort24HourVolume0'
  | 'sort24HourVolume1'
  | 'sort24HourVolume2'
  | 'sort24HourVolume3'
  | 'sort24HourVolume4'
  | 'sort24HourVolume5'
  | 'sort24HourVolume6'
  | 'sort24HourVolume7'
  | 'sort24HourVolume8'
  | 'sort24HourVolume9'
  | 'sort24HourVolume10'
  | 'sort24HourVolume11'
  | 'sort24HourVolume12'
  | 'sort24HourVolume13'
  | 'sort24HourVolume14'
  | 'sort24HourVolume15'
  | 'sort24HourVolume16'
  | 'sort24HourVolume17'
  | 'sort24HourVolume18'
  | 'sort24HourVolume19'
  | 'sort24HourVolume20'
  | 'sort24HourVolume21'
  | 'sort24HourVolume22'
  | 'sort24HourVolume23'

export enum CurationSource {
  ALL_SOURCES = 'All Sources',
  DXDAO = 'Dxdao',
  KLEROS = 'Kleros',
  NO_SOURCES = 'No Sources',
}

export interface MarketFilters {
  state: MarketStates
  category: string
  title: Maybe<string>
  sortBy: Maybe<MarketsSortCriteria>
  sortByDirection: 'desc' | 'asc'
  arbitrator: Maybe<string>
  templateId: Maybe<string>
  currency: Maybe<string>
  curationSource: CurationSource
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
  payouts: Maybe<Big[]>
  question: Question
  totalEarnings: BigNumber
  totalPoolShares: BigNumber
  userEarnings: BigNumber
  userPoolShares: BigNumber
  klerosTCRregistered: boolean
  curatedByDxDao: boolean
  curatedByDxDaoOrKleros: boolean
  runningDailyVolumeByHour: BigNumber[]
  lastActiveDay: number
  oracle: string
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
export type Period = '1H' | '1D' | '1W' | '1M' | '1Y' | 'All'

export type CategoryDataItem = {
  id: string
  numOpenConditions: number
  numClosedConditions: number
  numConditions: number
}

export type GraphResponseCategories = {
  categories: CategoryDataItem[]
}

export type TopCategoryItem = {
  id: string
  typename: string
}

export type GraphResponseTopCategories = {
  categories: TopCategoryItem[]
}

export type GraphMarketMakerDataItem = {
  id: string
  creationTimestamp: string
  collateralVolume: string
  lastActiveDay: number
  collateralToken: string
  outcomeTokenAmounts: string[]
  title: string
  outcomes: Maybe<string[]>
  openingTimestamp: string
  arbitrator: string
  category: string
  templateId: string
  usdLiquidityParameter: string
  curatedByDxDao: boolean
  scaledLiquidityParameter: string
  klerosTCRregistered: boolean
  curatedByDxDaoOrKleros: boolean
  runningDailyVolumeByHour: BigNumber[]
}

export type Participations = { fixedProductMarketMakers: GraphMarketMakerDataItem }

export type GraphResponseMyMarkets = { account: { fpmmParticipations: Participations[] } }

export type GraphResponseMarketsGeneric = {
  fixedProductMarketMakers: GraphMarketMakerDataItem[]
}

export type GraphResponseMarkets = GraphResponseMarketsGeneric | GraphResponseMyMarkets

export type MarketMakerDataItem = {
  address: string
  creationTimestamp: string
  collateralVolume: BigNumber
  collateralToken: string
  lastActiveDay: number
  outcomeTokenAmounts: BigNumber[]
  title: string
  outcomes: Maybe<string[]>
  openingTimestamp: Date
  arbitrator: string
  category: string
  templateId: number
  usdLiquidityParameter: number
  curatedByDxDao: boolean
  scaledLiquidityParameter: number
  klerosTCRregistered: boolean
  curatedByDxDaoOrKleros: boolean
  runningDailyVolumeByHour: BigNumber[]
}

export type BuildQueryType = MarketFilters & {
  whitelistedCreators: boolean
  whitelistedTemplateIds: boolean
  networkId: Maybe<number>
}
