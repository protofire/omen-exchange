import { createSlice } from '@reduxjs/toolkit'
import { ERC20Service } from '../services'
import { BigNumber } from 'ethers/utils'

type BalanceState = {
  balance: Maybe<BigNumber>
}

const initialState: BalanceState = {
  balance: null,
}

const balanceSlice = createSlice({
  name: 'balance',
  initialState,
  reducers: {
    setBalance(state, action) {
      const { balance } = action.payload
      state.balance = balance
    },
  },
})
export const { setBalance } = balanceSlice.actions
export default balanceSlice.reducer

export const fetchAccountBalance = (account: any, provider: any, collateral: any) => async (
  dispatch: any,
) => {
  const collateralService = new ERC20Service(provider, account, collateral.address)
  try {
    if (account) {
      const balance = await collateralService.getCollateral(account)
      dispatch(setBalance({ balance: balance.toString() }))
    } else {
      dispatch(setBalance({ balance: null }))
    }
  } catch (err) {
    console.error(err)
  }
}
