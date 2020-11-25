import { createReducer } from '@reduxjs/toolkit'

import { updatePositions, updateOptions, updateOrder } from './actions'

import { Quantity } from '@/lib/entities'

export interface LoadingState {
  positions: number
  options: number
  order: number
}

export const initialState: LoadingState = {
  positions: 0,
  balance: 0,
  options: 0,
}

export default createReducer(initialState, (builder) => {
  builder
    .addCase(updatePositions, (state, { payload: positions }) => {
      return { ...state, positions }
    })
    .addCase(updateOrder, (state, { payload: options }) => {
      return { ...state, options }
    })
    .addCase(updateOptions, (state, { payload: options }) => {
      return { ...state, options }
    })
})
