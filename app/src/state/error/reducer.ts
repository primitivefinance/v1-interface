import { createReducer } from '@reduxjs/toolkit'

import { throwError, clearError } from './actions'

export interface ErrorState {
  error: boolean
  msg: string
  link: string
}

export const initialState: ErrorState = {
  error: false,
  msg: '',
  link: '',
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(throwError, (state, { payload: { msg, link } }) => {
      state = { error: true, msg: msg, link: link }
    })
    .addCase(clearError, (state) => {
      state = initialState
    })
)
