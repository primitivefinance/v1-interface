import { createReducer } from '@reduxjs/toolkit'
import { typeInput } from './actions'

export interface SwapState {
  readonly typedValue: string
}

const initialState: SwapState = {
  typedValue: '',
}

export default createReducer<SwapState>(initialState, (builder) =>
  builder.addCase(typeInput, (state, { payload: { typedValue } }) => {
    return {
      ...state,
      typedValue,
    }
  })
)
