enum Types {
  Ready = 'Ready',
  PostingQuestion = 'Posting question to realitio',
  PrepareCondition = 'Prepare condition',
  ApprovingCollateral = 'Approving collateral',
  CreateMarketMaker = 'Create market maker',
  ApproveCollateralForMarketMaker = 'Approve collateral for market maker',
  AddFunding = 'Add funding in market maker',
  InitialTradeInMarketMaker = 'initial trade in market maker',
  Done = 'Done',
  Error = 'Error',
}

interface Ready {
  readonly _type: Types.Ready
}
interface PostingQuestion {
  readonly _type: Types.PostingQuestion
}
interface PrepareCondition {
  readonly _type: Types.PrepareCondition
}
interface ApprovingCollateral {
  readonly _type: Types.ApprovingCollateral
}
interface CreateMarketMaker {
  readonly _type: Types.CreateMarketMaker
}
interface ApproveCollateralForMarketMaker {
  readonly _type: Types.ApproveCollateralForMarketMaker
}
interface AddFunding {
  readonly _type: Types.AddFunding
}
interface InitialTradeInMarketMaker {
  readonly _type: Types.InitialTradeInMarketMaker
}
interface Done {
  readonly _type: Types.Done
}
interface Error {
  readonly _type: Types.Error
  readonly error: Error
}

export type MarketCreationStatus =
  | Ready
  | PostingQuestion
  | PrepareCondition
  | ApprovingCollateral
  | CreateMarketMaker
  | ApproveCollateralForMarketMaker
  | AddFunding
  | InitialTradeInMarketMaker
  | Done
  | Error

const isReady = (mcsd: MarketCreationStatus): mcsd is Ready => mcsd._type === Types.Ready
const isPostingQuestion = (mcsd: MarketCreationStatus): mcsd is PostingQuestion =>
  mcsd._type === Types.PostingQuestion
const isPrepareCondition = (mcsd: MarketCreationStatus): mcsd is PrepareCondition =>
  mcsd._type === Types.PrepareCondition
const isApprovingCollateral = (mcsd: MarketCreationStatus): mcsd is ApprovingCollateral =>
  mcsd._type === Types.ApprovingCollateral
const isCreateMarketMaker = (mcsd: MarketCreationStatus): mcsd is CreateMarketMaker =>
  mcsd._type === Types.CreateMarketMaker
const isApproveCollateralForMarketMaker = (
  mcsd: MarketCreationStatus,
): mcsd is ApproveCollateralForMarketMaker => mcsd._type === Types.ApproveCollateralForMarketMaker
const isAddFunding = (mcsd: MarketCreationStatus): mcsd is AddFunding =>
  mcsd._type === Types.AddFunding
const isInitialTradeInMarketMaker = (
  mcsd: MarketCreationStatus,
): mcsd is InitialTradeInMarketMaker => mcsd._type === Types.InitialTradeInMarketMaker
const isDone = (mcsd: MarketCreationStatus): mcsd is Done => mcsd._type === Types.Done
const isError = (mcsd: MarketCreationStatus): mcsd is Error => mcsd._type === Types.Error

export const MarketCreationStatus = {
  ready: (): Ready => ({ _type: Types.Ready }),
  postingQuestion: (): PostingQuestion => ({ _type: Types.PostingQuestion }),
  prepareCondition: (): PrepareCondition => ({ _type: Types.PrepareCondition }),
  approvingCollateral: (): ApprovingCollateral => ({ _type: Types.ApprovingCollateral }),
  createMarketMaker: (): CreateMarketMaker => ({ _type: Types.CreateMarketMaker }),
  approveCollateralForMarketMaker: (): ApproveCollateralForMarketMaker => ({
    _type: Types.ApproveCollateralForMarketMaker,
  }),
  addFunding: (): AddFunding => ({ _type: Types.AddFunding }),
  initialTradeInMarketMaker: (): InitialTradeInMarketMaker => ({
    _type: Types.InitialTradeInMarketMaker,
  }),
  done: (): Done => ({ _type: Types.Done }),
  error: (error: Error): Error => ({ _type: Types.Error, error }),
  is: {
    ready: isReady,
    postingQuestion: isPostingQuestion,
    prepareCondition: isPrepareCondition,
    approvingCollateral: isApprovingCollateral,
    createMarketMaker: isCreateMarketMaker,
    approveCollateralForMarketMaker: isApproveCollateralForMarketMaker,
    addFunding: isAddFunding,
    initialTradeInMarketMaker: isInitialTradeInMarketMaker,
    done: isDone,
    error: isError,
  },
}
