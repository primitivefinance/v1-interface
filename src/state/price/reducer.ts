import { createReducer } from '@reduxjs/toolkit'

import { updatePrice } from './actions'

export const initialState = ''

export default createReducer(initialState, (builder) =>
  builder.addCase(updatePrice, (state, { payload: price }) => {
    return price
  })
)
