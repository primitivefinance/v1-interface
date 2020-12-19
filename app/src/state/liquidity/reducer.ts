import { createReducer } from '@reduxjs/toolkit'
import { clearInput, underInput, optionInput } from './actions'

export interface LPState {
  readonly optionValue: string
  readonly underlyingValue: string
}

export const initialState: LPState = {
  optionValue: '',
  underlyingValue: '',
}

export default createReducer<LPState>(initialState, (builder) =>
  builder
    .addCase(optionInput, (state, { payload: { optionValue } }) => {
      return {
        ...state,
        optionValue,
      }
    })
    .addCase(underInput, (state, { payload: { underlyingValue } }) => {
      return {
        ...state,
        underlyingValue,
      }
    })
    .addCase(clearInput, (state) => {
      return initialState
    })
)
