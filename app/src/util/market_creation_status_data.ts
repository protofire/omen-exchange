enum Types {
  Ready = 'Ready',
  CreatingAMarket = 'Creating market',
  AddFunding = 'Add funding',
  Done = 'Done',
  Error = 'Error',
}

interface Ready {
  readonly _type: Types.Ready
}
interface CreatingAMarket {
  readonly _type: Types.CreatingAMarket
}
interface AddFunding {
  readonly _type: Types.AddFunding
}
interface Done {
  readonly _type: Types.Done
}
interface Error {
  readonly _type: Types.Error
  readonly error: Error
}

export type MarketCreationStatus = Ready | CreatingAMarket | AddFunding | Done | Error

const isReady = (mcsd: MarketCreationStatus): mcsd is Ready => mcsd._type === Types.Ready
const isCreatingAMarket = (mcsd: MarketCreationStatus): mcsd is CreatingAMarket =>
  mcsd._type === Types.CreatingAMarket
const isAddFunding = (mcsd: MarketCreationStatus): mcsd is AddFunding =>
  mcsd._type === Types.AddFunding
const isDone = (mcsd: MarketCreationStatus): mcsd is Done => mcsd._type === Types.Done
const isError = (mcsd: MarketCreationStatus): mcsd is Error => mcsd._type === Types.Error

export const MarketCreationStatus = {
  ready: (): Ready => ({ _type: Types.Ready }),
  creatingAMarket: (): CreatingAMarket => ({ _type: Types.CreatingAMarket }),
  addFunding: (): AddFunding => ({ _type: Types.AddFunding }),
  done: (): Done => ({ _type: Types.Done }),
  error: (error: Error): Error => ({ _type: Types.Error, error }),
  is: {
    ready: isReady,
    creatingAMarket: isCreatingAMarket,
    addFunding: isAddFunding,
    done: isDone,
    error: isError,
  },
}
