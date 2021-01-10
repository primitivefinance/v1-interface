import { createReducer } from '@reduxjs/toolkit'

import { updatePositions, setLoading, clearPositions } from './actions'

import { TokenAmount } from '@uniswap/sdk'
import { BigNumberish } from 'ethers'
import { EmptyAttributes } from '@/state/options/reducer'
import { OptionsAttributes } from '@/state/options/actions'

export interface PositionsState {
  loading: boolean
  exists: boolean
  balance: TokenAmount
  options: OptionPosition[]
}

export type OptionPosition = {
  attributes: OptionsAttributes
  long: BigNumberish
  redeem: BigNumberish
  lp: BigNumberish
}

export const EmptyPositionAttributes = {
  attributes: EmptyAttributes,
  long: 0,
  redeem: 0,
  lp: 0,
}

export const initialState: PositionsState = {
  loading: true,
  exists: false,
  balance: null,
  options: [EmptyPositionAttributes],
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(
      updatePositions,
      (state, { payload: { loading, exists, balance, options } }) => {
        return { ...state, loading, exists, balance, options }
      }
    )
    .addCase(setLoading, () => {
      return initialState
    })
    .addCase(clearPositions, () => {
      return initialState
    })
)
