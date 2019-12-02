enum Types {
  allMarkets = '__mf_all_markets__',
  myMarkets = '__mf_my_markets__',
  fundedMarkets = '__mf_funded_markets__',
  investedMarkets = '__mf_invested_markets__',
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

export type MarketFilter = AllMarkets | MyMarkets | FundedMarkets | InvestedMarkets

const isAllMarkets = (mf: MarketFilter): mf is AllMarkets => mf._type === Types.allMarkets
const isMyMarkets = (mf: MarketFilter): mf is MyMarkets => mf._type === Types.myMarkets
const isFundedMarkets = (mf: MarketFilter): mf is FundedMarkets => mf._type === Types.fundedMarkets
const isInvestedMarkets = (mf: MarketFilter): mf is InvestedMarkets =>
  mf._type === Types.investedMarkets

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
    label: "Markets I've invested",
  }),
  is: {
    allMarkets: isAllMarkets,
    myMarkets: isMyMarkets,
    fundedMarkets: isFundedMarkets,
    investedMarkets: isInvestedMarkets,
  },
}
