import { createReducer } from '@reduxjs/toolkit'

import { updateOptions, OptionsAttributes, clearOptions } from './actions'

import { BigNumberish } from 'ethers'

export interface OptionsState {
  loading: boolean
  calls: OptionsAttributes[]
  puts: OptionsAttributes[]
  reservesTotal: BigNumberish[]
}

export const EmptyAttributes = {
  entity: null,
  asset: '',
  market: null,
  id: '',
  venue: 0,
}

export const initialState: OptionsState = {
  loading: true,
  calls: [EmptyAttributes],
  puts: [EmptyAttributes],
  reservesTotal: [0, 0],
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(
      updateOptions,
      (state, { payload: { loading, calls, puts, reservesTotal } }) => {
        return { ...state, loading, calls, puts, reservesTotal }
      }
    )
    .addCase(clearOptions, (state) => {
      return initialState
    })
)
