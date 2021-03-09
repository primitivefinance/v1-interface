import { createReducer } from '@reduxjs/toolkit'
import { typeInput, setLoading, setReduce } from './actions'

export interface SwapState {
  readonly typedValue: string
  inputLoading: boolean
  reduce: boolean
}

const initialState: SwapState = {
  typedValue: '',
  inputLoading: false,
  reduce: false,
}

export default createReducer<SwapState>(initialState, (builder) =>
  builder
    .addCase(typeInput, (state, { payload: { typedValue } }) => {
      return {
        ...state,
        typedValue,
      }
    })
    .addCase(setLoading, (state, { payload: { inputLoading } }) => {
      return {
        ...state,
        inputLoading,
      }
    })
    .addCase(setReduce, (state, { payload: { reduce } }) => {
      return {
        ...state,
        reduce,
      }
    })
)
