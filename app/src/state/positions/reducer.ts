import { createReducer } from '@reduxjs/toolkit'

import { updatePositions } from './actions'

import { BigNumberish } from 'ethers'
import { OptionsAttributes, EmptyAttributes } from '@/state/options/reducer'

export interface PositionsState {
  loading: boolean
  exists: boolean
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
  options: [EmptyPositionAttributes],
}

export default createReducer(initialState, (builder) =>
  builder.addCase(
    updatePositions,
    (state, { payload: { loading, exists, options } }) => {
      if (!state.loading) {
        return { loading, exists, options }
      }
      return state
    }
  )
)
