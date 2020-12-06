import { createReducer } from '@reduxjs/toolkit'
import { typeInput, setLoading } from './actions'

export interface SwapState {
  readonly typedValue: string
  inputLoading: boolean
}

const initialState: SwapState = {
  typedValue: '',
  inputLoading: false,
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
)
