import { BigNumber } from 'ethers/utils'

export enum Status {
  Ready = 'Ready',
  Loading = 'Loading',
  Refreshing = 'Refreshing',
  Done = 'Done',
  Error = 'Error',
}

export enum OutcomeSlot {
  Yes = 'Yes',
  No = 'No',
}

export interface BalanceItem {
  outcomeName: string
  probability: number
  currentPrice: number
  shares: BigNumber
  holdings: BigNumber
  winningOutcome: boolean
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
  question: string
  resolution: Maybe<Date>
  arbitratorAddress: string
  category: string
  outcomes: string[]
}

export enum OutcomeTableValue {
  Probabilities = 'Outcome probabilities',
  CurrentPrice = 'Current Price',
  Shares = 'Shares',
  Payout = 'Payout',
  PriceAfterTrade = 'Price after trade',
}

export interface Token {
  address: string
  decimals: number
  symbol: string
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

export type MarketWithExtraData = Market &
  Question & {
    status: MarketStatus
    fee: BigNumber
  }

export interface Log {
  topics: Array<string>
  data: string
}

export interface Arbitrator {
  address: string
  name: string
  url: string
}

export enum Wallet {
  MetaMask = 'MetaMask',
  WalletConnect = 'WalletConnect',
}
