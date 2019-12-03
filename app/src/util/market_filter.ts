enum Types {
  allMarkets = '__mf_all_markets__',
  myMarkets = '__mf_my_markets__',
  fundedMarkets = '__mf_funded_markets__',
  investedMarkets = '__mf_invested_markets__',
  winningResultMarkets = '__mf_winning_result_markets__',
}

interface AllMarkets {
  readonly _type: Types.allMarkets
  readonly label: string
}
interface MyMarkets {
  readonly _type: Types.myMarkets
  readonly account: string
  readonly label: string
}
interface FundedMarkets {
  readonly _type: Types.fundedMarkets
  readonly account: string
  readonly label: string
}
interface InvestedMarkets {
  readonly _type: Types.investedMarkets
  readonly account: string
  readonly label: string
}
interface WinningResultMarkets {
  readonly _type: Types.winningResultMarkets
  readonly account: string
  readonly label: string
}

export type MarketFilter =
  | AllMarkets
  | MyMarkets
  | FundedMarkets
  | InvestedMarkets
  | WinningResultMarkets

const isAllMarkets = (mf: MarketFilter): mf is AllMarkets => mf._type === Types.allMarkets
const isMyMarkets = (mf: MarketFilter): mf is MyMarkets => mf._type === Types.myMarkets
const isFundedMarkets = (mf: MarketFilter): mf is FundedMarkets => mf._type === Types.fundedMarkets
const isInvestedMarkets = (mf: MarketFilter): mf is InvestedMarkets =>
  mf._type === Types.investedMarkets
const isWinningResultMarkets = (mf: MarketFilter): mf is WinningResultMarkets =>
  mf._type === Types.winningResultMarkets

export const MarketFilter = {
  allMarkets: (): AllMarkets => ({ _type: Types.allMarkets, label: 'All Markets' }),
  myMarkets: (account: string): MyMarkets => ({
    _type: Types.myMarkets,
    account,
    label: 'My Markets',
  }),
  fundedMarkets: (account: string): FundedMarkets => ({
    _type: Types.fundedMarkets,
    account,
    label: "Markets I've funded",
  }),
  investedMarkets: (account: string): InvestedMarkets => ({
    _type: Types.investedMarkets,
    account,
    label: "Markets I've invested in",
  }),
  winningResultMarkets: (account: string): WinningResultMarkets => ({
    _type: Types.winningResultMarkets,
    account,
    label: "Markets I've winning shares in",
  }),
  is: {
    allMarkets: isAllMarkets,
    myMarkets: isMyMarkets,
    fundedMarkets: isFundedMarkets,
    investedMarkets: isInvestedMarkets,
    winningResultMarkets: isWinningResultMarkets,
  },
}
