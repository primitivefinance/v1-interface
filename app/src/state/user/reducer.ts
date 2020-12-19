import { createReducer } from '@reduxjs/toolkit'

import { updateSlippage } from './actions'
import { DEFAULT_SLIPPAGE } from '@/constants/index'

export const initialState = DEFAULT_SLIPPAGE

export default createReducer(initialState, (builder) =>
  builder.addCase(updateSlippage, (state, { payload: slippage }) => {
    return slippage
  })
)
