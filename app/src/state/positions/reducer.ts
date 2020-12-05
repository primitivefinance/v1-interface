import { createReducer } from '@reduxjs/toolkit'

import { updatePositions, setLoading } from './actions'

import { Quantity } from '@/lib/entities'
import { BigNumberish } from 'ethers'
import { OptionsAttributes, EmptyAttributes } from '@/state/options/reducer'

export interface PositionsState {
  loading: boolean
  exists: boolean
  balance: Quantity
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
)
