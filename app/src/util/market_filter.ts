enum Types {
  allMarkets = '__mf_all_markets__',
  fundedMarkets = '__mf_funded_markets__',
  predictedOnMarkets = '__mf_predicted_on_markets__',
  winningResultMarkets = '__mf_winning_result_markets__',
}

interface AllMarkets {
  readonly _type: Types.allMarkets
  readonly label: string
}
interface FundedMarkets {
  readonly _type: Types.fundedMarkets
  readonly account: string
  readonly label: string
}
interface PredictedOnMarkets {
  readonly _type: Types.predictedOnMarkets
  readonly account: string
  readonly label: string
}
interface WinningResultMarkets {
  readonly _type: Types.winningResultMarkets
  readonly account: string
  readonly label: string
}

export type MarketFilter = AllMarkets | FundedMarkets | PredictedOnMarkets | WinningResultMarkets

const isAllMarkets = (mf: MarketFilter): mf is AllMarkets => mf._type === Types.allMarkets
const isFundedMarkets = (mf: MarketFilter): mf is FundedMarkets => mf._type === Types.fundedMarkets
const isPredictedOnMarkets = (mf: MarketFilter): mf is PredictedOnMarkets => mf._type === Types.predictedOnMarkets
const isWinningResultMarkets = (mf: MarketFilter): mf is WinningResultMarkets => mf._type === Types.winningResultMarkets

export const MarketFilter = {
  allMarkets: (): AllMarkets => ({ _type: Types.allMarkets, label: 'All Markets' }),
  fundedMarkets: (account: string): FundedMarkets => ({
    _type: Types.fundedMarkets,
    account,
    label: "Markets I've funded",
  }),
  predictedOnMarkets: (account: string): PredictedOnMarkets => ({
    _type: Types.predictedOnMarkets,
    account,
    label: 'Markets I predicted on',
  }),
  winningResultMarkets: (account: string): WinningResultMarkets => ({
    _type: Types.winningResultMarkets,
    account,
    label: "Markets I've winning shares in",
  }),
  is: {
    allMarkets: isAllMarkets,
    fundedMarkets: isFundedMarkets,
    predictedOnMarkets: isPredictedOnMarkets,
    winningResultMarkets: isWinningResultMarkets,
  },
}
