import { BigNumber } from 'ethers/utils'

export enum Status {
  Ready = 'Ready',
  Loading = 'Loading',
  Done = 'Done',
  Error = 'Error',
}

export enum OutcomeSlots {
  Yes = 'Yes',
  No = 'No',
}

export interface BalanceItems {
  outcomeName: string
  probability: string
  currentPrice: BigNumber
  shares: BigNumber
}

export enum Stage {
  Running = 0,
  Paused = 1,
  Closed = 2,
}

export enum StatusMarketCreation {
  Ready = 'Ready',
  PostingQuestion = 'Posting question to realitio',
  PrepareCondition = 'Prepare condition',
  ApprovingDAI = 'Approving DAI',
  CreateMarketMaker = 'Create market maker',
  ApproveDAIForMarketMaker = 'Approve dai for market maker',
  InitialTradeInMarketMaker = 'initial trade in market maker',
  Done = 'Done',
  Error = 'Error',
}
